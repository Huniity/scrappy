

using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.Common;
using Scrappy.DTOs.Requests;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Services.Interfaces;
using Scrappy.Validators;
using System.Globalization;

namespace Scrappy.Services;

public class EventService(IMongoDatabase database, IGeoDataService geoDataService)
{
    private readonly IMongoCollection<DistrictEvent> _eventsCollection =
        database.GetCollection<DistrictEvent>("DistrictEvents");

    public async Task<Result<DistrictEvent>> AddEvent(CreateEventDto dto)
    {
        if (dto.Location.Locality is null)
            return Result<DistrictEvent>.Failure("Locality is required in the location.");
        
        var geoData = geoDataService.Lookup(dto.Location.Locality.Value);

        if (geoData is null)
            return Result<DistrictEvent>.Failure("Could not find geo data for the provided locality.");

        var resolvedGeoData = geoData.Value;

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


        if (await Validator.IsDuplicateOnCreate(
                dto,
                resolvedGeoData.District,
                this))
        {
            return Result<DistrictEvent>.Failure(
                "An event with the same district, title, and start date already exists.");
        }

        var cleanLocation = dto.Location.Name.Trim();
        var qualityScore = EventQualityService.ComputeQualityScore(
            cleanDescription,
            startDate,
            cleanLocation,
            dto.Type);

        var districtEvent = new DistrictEvent
        {
            Id = ObjectId.GenerateNewId().ToString(),
            District = resolvedGeoData.District,
            Event = new Event
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Title = dto.Title.Trim(),
                Description = cleanDescription,
                StartDate = startDate,
                EndDate = endDate,
                Location = MapLocation(dto.Location, resolvedGeoData),
                SourceUrl = dto.SourceUrl.Trim(),
                AlternateName = dto.AlternateName?.Trim() ?? string.Empty,
                ImageUrl = dto.ImageUrl?.Trim() ?? string.Empty,
                DoorTime = dto.DoorTime,
                IsAccessibleForFree = dto.IsAccessibleForFree,
                PhysicalAccessibility = dto.PhysicalAccessibility,
                AgeRating = dto.AgeRating,
                Status = dto.Status ?? EventStatus.Scheduled,
                MaximumAttendeeCapacity = dto.MaximumAttendeeCapacity,
                Keywords = MapKeywords(dto.Keywords),
                Type = dto.Type!.Value,
                Organizer = MapAgents(dto.Organizer),
                Promoter = MapAgents(dto.Promoter),
                Maintainer = MapAgents(dto.Maintainer),
                Funder = MapAgents(dto.Funder),
                Actor = MapAgents(dto.Actor),
                Director = MapAgents(dto.Director),
                Composer = MapAgents(dto.Composer),
                Performers = MapAgents(dto.Performers),
                Audience = MapAudiences(dto.Audience),
                Duration = dto.Duration?.Trim(),
                AttendanceMode = dto.AttendanceMode,
                Offers = MapOffers(dto.Offers),
                QualityScore = qualityScore,
                Schedule = MapSchedule(dto.Schedule)
            }
        };

        await _eventsCollection.InsertOneAsync(districtEvent);
        return Result<DistrictEvent>.Success(districtEvent);
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
            : MapSchedule(dto.Schedule);

        if (!Validator.IsScheduleValid(schedule, startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid schedule.");

        if (dto.Offers is not null &&
            !Validator.AreOffersValid(dto.Offers, startDate, endDate))
        {
            return Result<DistrictEvent>.Failure("Invalid offers.");
        }

        var offers = dto.Offers is null
            ? existingEvent.Event.Offers
            : MapOffers(dto.Offers);

        if (!Validator.AreOffersValid(offers, startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid offers.");

        var eventType = dto.Type ?? existingEvent.Event.Type ?? EventType.Outro;
        var description = dto.Description?.Trim() ?? existingEvent.Event.Description;
        var location = dto.Location is null
            ? existingEvent.Event.Location
            : MapLocation(dto.Location);
        var locationName = location?.Name;
        var district = location?.District ?? existingEvent.District;
        var title = dto.Title?.Trim() ?? existingEvent.Event.Title;
        var alternateName = dto.AlternateName?.Trim() ?? existingEvent.Event.AlternateName;
        var imageUrl = dto.ImageUrl?.Trim() ?? existingEvent.Event.ImageUrl;
        var keywords = dto.Keywords is null
            ? existingEvent.Event.Keywords
            : MapKeywords(dto.Keywords);

        if (!Validator.IsTitleValid(title))
            return Result<DistrictEvent>.Failure("Invalid title.");

        if (await Validator.IsDuplicateOnUpdate(id, title, district, startDate, this))
        {
            return Result<DistrictEvent>.Failure(
                "An event with the same district, title, and start date already exists.");
        }

        if (dto.Organizer is not null)
            existingEvent.Event.Organizer = MapAgents(dto.Organizer);

        if (dto.Promoter is not null)
            existingEvent.Event.Promoter = MapAgents(dto.Promoter);

        if (dto.Maintainer is not null)
            existingEvent.Event.Maintainer = MapAgents(dto.Maintainer);

        if (dto.Performers is not null)
            existingEvent.Event.Performers = MapAgents(dto.Performers);

        if (dto.Funder is not null)
            existingEvent.Event.Funder = MapAgents(dto.Funder);

        if (dto.Actor is not null)
            existingEvent.Event.Actor = MapAgents(dto.Actor);

        if (dto.Director is not null)
            existingEvent.Event.Director = MapAgents(dto.Director);

        if (dto.Composer is not null)
            existingEvent.Event.Composer = MapAgents(dto.Composer);

        if (dto.Audience is not null)
            existingEvent.Event.Audience = MapAudiences(dto.Audience);

        if (dto.Schedule is not null)
            existingEvent.Event.Schedule = schedule;

        if (dto.Offers is not null)
            existingEvent.Event.Offers = offers;

        existingEvent.District = district;
        existingEvent.Event.Title = title;
        existingEvent.Event.Description = description;
        existingEvent.Event.StartDate = startDate;
        existingEvent.Event.EndDate = endDate;
        existingEvent.Event.Location = location;
        existingEvent.Event.SourceUrl = dto.SourceUrl?.Trim() ?? existingEvent.Event.SourceUrl;
        existingEvent.Event.AlternateName = alternateName;
        existingEvent.Event.ImageUrl = imageUrl;
        existingEvent.Event.DoorTime = dto.DoorTime ?? existingEvent.Event.DoorTime;
        existingEvent.Event.IsAccessibleForFree =
            dto.IsAccessibleForFree ?? existingEvent.Event.IsAccessibleForFree;
        existingEvent.Event.PhysicalAccessibility =
            dto.PhysicalAccessibility ?? existingEvent.Event.PhysicalAccessibility;
        existingEvent.Event.AgeRating = dto.AgeRating ?? existingEvent.Event.AgeRating;
        existingEvent.Event.MaximumAttendeeCapacity =
            dto.MaximumAttendeeCapacity ?? existingEvent.Event.MaximumAttendeeCapacity;
        existingEvent.Event.Keywords = keywords;
        existingEvent.Event.Type = eventType;
        existingEvent.Event.QualityScore = EventQualityService.ComputeQualityScore(
            description,
            startDate,
            locationName,
            eventType);
        existingEvent.Event.Duration = dto.Duration?.Trim() ?? existingEvent.Event.Duration;

        if (dto.AttendanceMode.HasValue)
            existingEvent.Event.AttendanceMode =
            dto.AttendanceMode;

        if (dto.Status.HasValue)
            existingEvent.Event.Status = dto.Status.Value;

        await _eventsCollection.ReplaceOneAsync(
            e => e.Id == existingEvent.Id,
            existingEvent);

        return Result<DistrictEvent>.Success(existingEvent);
    }

    private static EventLocation MapLocation(EventLocationRequestDto dto) => new()
    {
        Name = dto.Name.Trim(),
        StreetAddress = dto.StreetAddress?.Trim(),
        PostalCode = dto.PostalCode?.Trim(),
        Locality = dto.Locality!.Value,
        District = dto.District!.Value,
        Region = dto.Region!.Value,
        Country = dto.Country.Trim(),
        DicoCode = dto.DicoCode?.Trim(),
        Url = dto.Url,
        SameAs = dto.SameAs,
        Latitude = ParseCoordinate(dto.Latitude),
        Longitude = ParseCoordinate(dto.Longitude)
    };

    private static EventLocation MapLocation(
        EventLocationRequestDto dto,
        (DistrictName? District, Nuts2Region Region, string DicoCode) geoData) => new()
    {
        Name = dto.Name.Trim(),
        StreetAddress = dto.StreetAddress?.Trim(),
        PostalCode = dto.PostalCode?.Trim(),
        Locality = dto.Locality!.Value,
        District = geoData.District,
        Region = geoData.Region,
        Country = "PT",
        DicoCode = geoData.DicoCode,
        Url = dto.Url,
        SameAs = dto.SameAs,
        Latitude = ParseCoordinate(dto.Latitude),
        Longitude = ParseCoordinate(dto.Longitude)
    };

    private static double? ParseCoordinate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return double.TryParse(
            value,
            NumberStyles.Float,
            CultureInfo.InvariantCulture,
            out var coordinate)
            ? coordinate
            : null;
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

    private static AgentModel MapAgent(EventAgentRequestDto dto) => new()
    {
        Name = dto.Name.Trim(),
        Type = dto.Type,
        Url = dto.Url?.Trim(),
        ImageUrl = dto.ImageUrl?.Trim(),
        SameAs = dto.SameAs?.Trim()
    };

    private static List<AgentModel> MapAgents( IEnumerable<EventAgentRequestDto>? agents)
    {
        return agents?
            .Where(agent => agent is not null)
            .Select(MapAgent)
            .ToList() ?? new();
    }

    private static OfferModel MapOffer(EventOfferRequestDto dto) => new()
    {
        Name = dto.Name.Trim(),
        Price = dto.Price,
        PriceCurrency = dto.PriceCurrency.Trim().ToUpperInvariant(),
        Availability = dto.Availability.Trim(),
        Url = dto.Url?.Trim(),
        ValidFrom = dto.ValidFrom
    };

    private static List<OfferModel> MapOffers(
        IEnumerable<EventOfferRequestDto>? offers)
    {
        return offers?
            .Select(MapOffer)
            .ToList() ?? new();
    }

    private static AudienceModel MapAudience(EventAudienceRequestDto dto) => new()
    {
        Name = dto.Name?.Trim(),
        AudienceType = dto.AudienceType?.Trim()
    };

    private static List<AudienceModel> MapAudiences(IEnumerable<EventAudienceRequestDto>? audiences)
    {
        return audiences?
            .Select(MapAudience)
            .ToList() ?? new();
    }

    private static List<string> MapKeywords(IEnumerable<string>? keywords)
    {
        return keywords?
            .Select(keyword => keyword.Trim())
            .ToList() ?? new();
    }

    private static ScheduleModel? MapSchedule(EventScheduleRequestDto? dto)
    {
        if (dto is null)
            return null;

        return new ScheduleModel
        {
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            StartTime = dto.StartTime?.Trim(),
            EndTime = dto.EndTime?.Trim(),
            TimeZone = dto.TimeZone?.Trim() ?? "Europe/Lisbon",
            RepeatDays = dto.RepeatDays
        };
    }
}
