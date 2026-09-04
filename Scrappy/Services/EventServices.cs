

using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.Common;
using Scrappy.DTOs.Requests;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Mappers;
using Scrappy.Services.Interfaces;
using Scrappy.Validators;

namespace Scrappy.Services;

public class EventService(IMongoDatabase database, IGeoDataService geoDataService)
{
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<LocalityName, SemaphoreSlim>
        IngestionLocks = new();

    private readonly IMongoCollection<DistrictEvent> _eventsCollection =
        database.GetCollection<DistrictEvent>("DistrictEvents");

    public string LastIngestionAction { get; private set; } = "created";
    public IReadOnlyList<string> LastUpdatedFields { get; private set; } = [];

    public async Task<Result<DistrictEvent>> AddEvent(CreateEventDto dto)
    {
        if (dto.Location.Locality is null)
            return Result<DistrictEvent>.Failure("Locality is required in the location.");
        
        var geoData = geoDataService.Lookup(dto.Location.Locality.Value);

        if (geoData is null)
            return Result<DistrictEvent>.Failure("Could not find geo data for the provided locality.");

        dto.Location.District = geoData.Value.District;
        dto.Location.Region = geoData.Value.Region;
        dto.Location.DicoCode = geoData.Value.DicoCode;

        if (!Validator.IsTitleValid(dto.Title))
            return Result<DistrictEvent>.Failure("Invalid title.");

        var cleanDescription = CreateEventInputNormalizer.NormalizeDescription(
            dto.Description,
            dto.Title);

        if (!Validator.IsDescriptionValid(cleanDescription))
            return Result<DistrictEvent>.Failure("Invalid description.");

        if (!CreateEventInputNormalizer.TryNormalizeDates(
                dto.StartDate,
                dto.EndDate,
                out var startDate,
                out var endDate,
                out var dateError))
        {
            return Result<DistrictEvent>.Failure(dateError);
        }

        if (!Validator.AreDatesValid(startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid start or end date.");

        var isFinished = EventLifecycleRules.IsFinished(
            startDate,
            endDate,
            DateTime.UtcNow);
        DateTime? retentionUntil = isFinished
            ? EventLifecycleRules.GetRetentionUntil(startDate, endDate)
            : null;

        if (!Validator.IsAlternateNameValid(dto.AlternateName))
            return Result<DistrictEvent>.Failure("Invalid alternate name.");

        if (!Validator.IsOptionalUrlValid(dto.ImageUrl))
            return Result<DistrictEvent>.Failure("Invalid image URL.");

        if (!Validator.IsAgeRatingValid(dto.AgeRating))
            return Result<DistrictEvent>.Failure("Invalid age rating.");

        if (!Validator.IsMaximumAttendeeCapacityValid(dto.MaximumAttendeeCapacity))
            return Result<DistrictEvent>.Failure("Invalid maximum attendee capacity.");

        if (!Validator.IsDoorTimeValid(dto.DoorTime, startDate))
            return Result<DistrictEvent>.Failure("Invalid door time.");

        if (!Validator.IsDurationValid(dto.Duration))
            return Result<DistrictEvent>.Failure("Invalid duration.");

        if (!Validator.IsAttendanceModeValid(dto.AttendanceMode))
            return Result<DistrictEvent>.Failure("Invalid attendance mode.");

        if (!Validator.IsEventStatusValid(dto.Status))
            return Result<DistrictEvent>.Failure( "Invalid event status.");

        if (!Validator.AreKeywordsValid(dto.Keywords))
            return Result<DistrictEvent>.Failure("Invalid keywords.");

        if (!Validator.IsScheduleValid(dto.Schedule, startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid schedule.");

        if (!Validator.AreOffersValid(dto.Offers, startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid offers.");

        if (!Validator.IsTypeValid(dto.Type))
            return Result<DistrictEvent>.Failure("Invalid event type.");

        if (!Validator.IsCreateLocationValid(dto.Location))
            return Result<DistrictEvent>.Failure("Invalid location.");



        if (!Validator.IsSourceUrlValid(dto.SourceUrl))
            return Result<DistrictEvent>.Failure("Invalid source URL.");

    
        if (!Validator.AreAgentsValid(dto.Organizer))
            return Result<DistrictEvent>.Failure("Invalid organizers.");

        if (!Validator.AreAgentsValid(dto.Promoter))
            return Result<DistrictEvent>.Failure("Invalid promoters.");

        if (!Validator.AreAgentsValid(dto.Maintainer))
            return Result<DistrictEvent>.Failure("Invalid maintainers.");

        if (!Validator.AreAgentsValid(dto.Performers))
            return Result<DistrictEvent>.Failure("Invalid performers.");

        if (!Validator.AreAgentsValid(dto.Funder))
            return Result<DistrictEvent>.Failure("Invalid funders.");

        if (!Validator.AreAgentsValid(dto.Actor))
            return Result<DistrictEvent>.Failure("Invalid actors.");

        if (!Validator.AreAgentsValid(dto.Director))
            return Result<DistrictEvent>.Failure("Invalid directors.");

        if (!Validator.AreAgentsValid(dto.Composer))
            return Result<DistrictEvent>.Failure("Invalid composers.");

        if (!Validator.AreAudiencesValid(dto.Audience))
            return Result<DistrictEvent>.Failure("Invalid audience.");


        var cleanLocation = dto.Location.Name.Trim();
        var qualityScore = EventQualityService.ComputeQualityScore(
            cleanDescription,
            startDate,
            cleanLocation,
            dto.Type);

        var districtEvent = dto.ToEntity(
            startDate,
            endDate,
            cleanDescription,
            qualityScore,
            isFinished,
            retentionUntil);

        // Prevent two concurrent ingestion jobs for the same locality from both
        // observing "no match" and inserting duplicate documents.
        var ingestionLock = IngestionLocks.GetOrAdd(
            dto.Location.Locality.Value,
            _ => new SemaphoreSlim(1, 1));
        await ingestionLock.WaitAsync();
        try
        {
            var candidateStart = startDate.AddDays(-1);
            var candidateEnd = startDate.AddDays(1);
            var candidates = await _eventsCollection.Find(existing =>
                    existing.Event.Location != null &&
                    existing.Event.Location.Locality == dto.Location.Locality.Value &&
                    existing.Event.StartDate >= candidateStart &&
                    existing.Event.StartDate <= candidateEnd)
                .ToListAsync();

            var duplicate = EventDeduplicationService.FindMatch(candidates, districtEvent);
            if (duplicate is not null)
            {
                var updatedFields = EventDeduplicationService.Merge(duplicate, districtEvent);
                LastUpdatedFields = updatedFields;

                if (updatedFields.Count == 0)
                {
                    LastIngestionAction = "skipped";
                    return Result<DistrictEvent>.Success(duplicate);
                }

                LastIngestionAction = "merged";
                await _eventsCollection.ReplaceOneAsync(
                    existing => existing.Id == duplicate.Id,
                    duplicate);
                return Result<DistrictEvent>.Success(duplicate);
            }

            await _eventsCollection.InsertOneAsync(districtEvent);
            LastIngestionAction = "created";
            LastUpdatedFields = [];
            return Result<DistrictEvent>.Success(districtEvent);
        }
        finally
        {
            ingestionLock.Release();
        }
    }

    public async Task<Result<DistrictEvent>> UpdateEvent(
        string id,
        UpdateEventDto dto)
    {
        if (!ObjectId.TryParse(id, out _))
            return Result<DistrictEvent>.Failure("Invalid event id.");

        var existingEvent = await _eventsCollection
            .Find(e => e.Id == id)
            .FirstOrDefaultAsync();

        if (existingEvent is null)
            return Result<DistrictEvent>.Failure("Event not found");

        if (dto.Title is not null && !Validator.IsTitleValid(dto.Title))
        {
            return Result<DistrictEvent>.Failure("Invalid title.");
        }

        if (dto.Description is not null && !Validator.IsDescriptionValid(dto.Description))
        {
            return Result<DistrictEvent>.Failure("Invalid description.");
        }

        if (dto.Type.HasValue && !Validator.IsTypeValid(dto.Type.Value))
            return Result<DistrictEvent>.Failure("Invalid event type.");

        if (dto.Location is not null && !Validator.IsLocationValid(dto.Location))
            return Result<DistrictEvent>.Failure("Invalid location.");

        if (dto.SourceUrl is not null && !Validator.IsSourceUrlValid(dto.SourceUrl))
        {
            return Result<DistrictEvent>.Failure("Invalid source URL.");
        }

        if (!Validator.AreAgentsValid(dto.Organizer))
            return Result<DistrictEvent>.Failure("Invalid organizers.");

        if (!Validator.AreAgentsValid(dto.Promoter))
            return Result<DistrictEvent>.Failure("Invalid promoters.");

        if (!Validator.AreAgentsValid(dto.Maintainer))
            return Result<DistrictEvent>.Failure("Invalid maintainers.");

        if (!Validator.AreAgentsValid(dto.Performers))
            return Result<DistrictEvent>.Failure("Invalid performers.");

        if (!Validator.AreAgentsValid(dto.Funder))
            return Result<DistrictEvent>.Failure("Invalid funders.");

        if (!Validator.AreAgentsValid(dto.Actor))
            return Result<DistrictEvent>.Failure("Invalid actors.");

        if (!Validator.AreAgentsValid(dto.Director))
            return Result<DistrictEvent>.Failure("Invalid directors.");

        if (!Validator.AreAgentsValid(dto.Composer))
            return Result<DistrictEvent>.Failure("Invalid composers.");

        if (!Validator.AreAudiencesValid(dto.Audience))
            return Result<DistrictEvent>.Failure("Invalid audience.");


        var startDate = dto.StartDate ?? existingEvent.Event.StartDate;
        var endDate = dto.EndDate ?? existingEvent.Event.EndDate;

        if (!Validator.AreDatesValid(startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid start or end date.");

        var isFinished = EventLifecycleRules.IsFinished(
            startDate,
            endDate,
            DateTime.UtcNow);
        DateTime? retentionUntil = isFinished
            ? EventLifecycleRules.GetRetentionUntil(startDate, endDate)
            : null;

        if (dto.AlternateName is not null &&
            !Validator.IsAlternateNameValid(dto.AlternateName))
        {
            return Result<DistrictEvent>.Failure("Invalid alternate name.");
        }

        if (dto.ImageUrl is not null &&
            !Validator.IsOptionalUrlValid(dto.ImageUrl))
        {
            return Result<DistrictEvent>.Failure("Invalid image URL.");
        }

        if (dto.AgeRating is not null &&
            !Validator.IsAgeRatingValid(dto.AgeRating))
        {
            return Result<DistrictEvent>.Failure("Invalid age rating.");
        }

        if (dto.MaximumAttendeeCapacity is not null &&
            !Validator.IsMaximumAttendeeCapacityValid(dto.MaximumAttendeeCapacity))
        {
            return Result<DistrictEvent>.Failure("Invalid maximum attendee capacity.");
        }

        if (dto.DoorTime is not null &&
            !Validator.IsDoorTimeValid(dto.DoorTime, startDate))
        {
            return Result<DistrictEvent>.Failure("Invalid door time.");
        }                

        if (dto.Duration is not null &&
            !Validator.IsDurationValid(dto.Duration))
        {
            return Result<DistrictEvent>.Failure("Invalid duration.");
        }

        if (dto.AttendanceMode.HasValue &&
            !Validator.IsAttendanceModeValid(dto.AttendanceMode))
        {
            return Result<DistrictEvent>.Failure("Invalid attendance mode.");
        }

        if (!Validator.IsEventStatusValid(dto.Status))
        {
            return Result<DistrictEvent>.Failure(
                "Invalid event status.");
        }

        if (dto.Keywords is not null &&
            !Validator.AreKeywordsValid(dto.Keywords))
        {
            return Result<DistrictEvent>.Failure("Invalid keywords.");
        }

        var schedule = dto.Schedule is null
            ? existingEvent.Event.Schedule
            : dto.Schedule.ToScheduleModel();

        if (!Validator.IsScheduleValid(schedule, startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid schedule.");

        if (dto.Offers is not null &&
            !Validator.AreOffersValid(dto.Offers, startDate, endDate))
        {
            return Result<DistrictEvent>.Failure("Invalid offers.");
        }

        var offers = dto.Offers is null
            ? existingEvent.Event.Offers
            : dto.Offers.Select(offer => offer.ToOfferModel()).ToList();

        if (!Validator.AreOffersValid(offers, startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid offers.");

        var eventType = dto.Type ?? existingEvent.Event.Type ?? EventType.Outro;
        var description = dto.Description?.Trim() ?? existingEvent.Event.Description;
        var location = dto.Location is null
            ? existingEvent.Event.Location
            : dto.Location.ToEventLocation();
        var locationName = location?.Name;
        var district = location?.District ?? existingEvent.District;
        var title = dto.Title?.Trim() ?? existingEvent.Event.Title;
        var alternateName = dto.AlternateName?.Trim() ?? existingEvent.Event.AlternateName;
        var imageUrl = dto.ImageUrl?.Trim() ?? existingEvent.Event.ImageUrl;
        var keywords = dto.Keywords is null
            ? existingEvent.Event.Keywords
            : dto.Keywords.Select(keyword => keyword.Trim()).ToList();

        if (!Validator.IsTitleValid(title))
            return Result<DistrictEvent>.Failure("Invalid title.");

        if (await Validator.IsDuplicateOnUpdate(id, title, district, startDate, this))
        {
            return Result<DistrictEvent>.Failure(
                "An event with the same district, title, and start date already exists.");
        }

        existingEvent.UpdateEntity(dto);

        existingEvent.District = district;
        existingEvent.Event.StartDate = startDate;
        existingEvent.Event.EndDate = endDate;
        existingEvent.Event.Location = location;
        existingEvent.Event.Schedule = schedule;
        existingEvent.Event.Offers = offers;
        existingEvent.Event.Keywords = keywords;
        existingEvent.Event.IsFinished = isFinished;
        existingEvent.Event.RetentionUntil = retentionUntil;
        existingEvent.Event.Type = eventType;
        existingEvent.Event.QualityScore = EventQualityService.ComputeQualityScore(
            description,
            startDate,
            locationName,
            eventType);

        await _eventsCollection.ReplaceOneAsync(
            e => e.Id == existingEvent.Id,
            existingEvent);

        return Result<DistrictEvent>.Success(existingEvent);
    }

    public async Task<Result<DistrictEvent>> DeleteEvent(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return Result<DistrictEvent>.Failure("Invalid event id.");

        var districtEvent = await _eventsCollection
            .FindOneAndDeleteAsync(e => e.Id == id);

        return districtEvent is null
            ? Result<DistrictEvent>.Failure("Event not found")
            : Result<DistrictEvent>.Success(districtEvent);
    }

    public async Task<Result<IEnumerable<DistrictEvent>>> GetAllEvents()
    {
        var events = await _eventsCollection.Find(_ => true).ToListAsync();
        return Result<IEnumerable<DistrictEvent>>.Success(events);
    }

    public async Task<Result<DistrictEvent>> GetEventById(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return Result<DistrictEvent>.Failure("Invalid event id.");

        var districtEvent = await _eventsCollection
            .Find(e => e.Id == id)
            .FirstOrDefaultAsync();

        return districtEvent is null
            ? Result<DistrictEvent>.Failure($"Event with id {id} not found.")
            : Result<DistrictEvent>.Success(districtEvent);
    }

}
