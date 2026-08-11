

using Scrappy.Models;
using Scrappy.DTOs;
using Scrappy.Common;
using Scrappy.Validators;
using MongoDB.Driver;
using MongoDB.Bson;

namespace Scrappy.Services;
public partial class EventService(IMongoDatabase database)
{
    private readonly IMongoCollection<DistrictEvent> _eventsCollection = database.GetCollection<DistrictEvent>("DistrictEvents");
    public async Task<Result<DistrictEvent>> AddEvent(CreateEventDto dto)
    {

        if (!await Validator.IsTitleValidAndAvailable(dto.Title, eventService: this))
                return Result<DistrictEvent>.Failure("Invalid Title.");

        if (!Validator.AreDatesValid(dto.StartDate, dto.EndDate))
            return Result<DistrictEvent>.Failure("Invalid StartDate or EndDate.");

        if (!Validator.IsDistrictValid(dto.District))
            return Result<DistrictEvent>.Failure("Invalid District.");

        if (!Validator.IsTypeValid(dto.Type))
            return Result<DistrictEvent>.Failure("Invalid Type.");

        if (!Validator.IsDescriptionValid(dto.Description))
            return Result<DistrictEvent>.Failure("Invalid Description.");

        if (!Validator.IsLocationValid(dto.Location))
            return Result<DistrictEvent>.Failure("Invalid Location.");

        if (!Validator.IsSourceUrlValid(dto.SourceUrl))
            return Result<DistrictEvent>.Failure("Invalid SourceUrl.");

        if (await Validator.IsDuplicateOnCreate(dto, this))
        {
            return Result<DistrictEvent>.Failure("An event with the same District, Title, and StartDate already exists.");
        }  

        DateTime? startDate = Event.ParsingDate(dto.StartDate);
        DateTime? endDate = string.IsNullOrEmpty(dto.EndDate) ? null : Event.ParsingDate(dto.EndDate);

        Enum.TryParse(dto.District, true, out DistrictName district);
        Enum.TryParse(dto.Type, true, out EventType eventType);

        string cleanTitle = dto.Title.Trim();
        string? cleanDescription = dto.Description?.Trim();
        string? cleanLocation = dto.Location?.Trim();
        string? cleanSourceUrl = dto.SourceUrl?.Trim();

        decimal qualityScore = EventQualityService.ComputeQualityScore(cleanDescription, startDate, cleanLocation, eventType);

        DistrictEvent districtEvent = new()
        {
            Id = ObjectId.GenerateNewId().ToString(),
            District = district,
            Event = new Event{
                Id = ObjectId.GenerateNewId().ToString(),
                Title = cleanTitle,
                Description = cleanDescription,
                StartDate = startDate ?? DateTime.MinValue,
                EndDate = endDate,
                Location = cleanLocation,
                SourceUrl = cleanSourceUrl ?? string.Empty,
                Type = eventType,
                QualityScore = qualityScore
            },
        };


        await _eventsCollection.InsertOneAsync(districtEvent);
        return Result<DistrictEvent>.Success(districtEvent);
    }

    public async Task<Result<DistrictEvent>> UpdateEvent(string id, UpdateEventDto dto)
    {
        if (!ObjectId.TryParse(id, out _))
            return Result<DistrictEvent>.Failure("Invalid event id.");

        var existingEvent = await _eventsCollection.Find(e => e.Id == id).FirstOrDefaultAsync();
        if (existingEvent != null)
        {
            if (dto.Title is not null)
            {
                var cleanTitle = dto.Title.Trim();
                if (cleanTitle.Length is 0 or > 250)
                    return Result<DistrictEvent>.Failure("Invalid Title.");

                var otherEvents = await _eventsCollection.Find(e => e.Id != id).ToListAsync();
                if (otherEvents.Any(e => e.Event.Title.Trim().Equals(
                    cleanTitle, StringComparison.OrdinalIgnoreCase)))
                {
                    return Result<DistrictEvent>.Failure("An event with that title already exists.");
                }
            }

            if (dto.District is not null && !Validator.IsDistrictValid(dto.District))
                return Result<DistrictEvent>.Failure("Invalid District.");

            if (dto.Type is not null && !Validator.IsTypeValid(dto.Type))
                return Result<DistrictEvent>.Failure("Invalid Type.");

            if (dto.Description is not null && !Validator.IsDescriptionValid(dto.Description))
                return Result<DistrictEvent>.Failure("Invalid Description.");

            if (dto.Location is not null && !Validator.IsLocationValid(dto.Location))
                return Result<DistrictEvent>.Failure("Invalid Location.");

            if (dto.SourceUrl is not null && !Validator.IsSourceUrlValid(dto.SourceUrl))
                return Result<DistrictEvent>.Failure("Invalid SourceUrl.");

            DateTime startDate = existingEvent.Event.StartDate;
            if (dto.StartDate is not null)
            {
                var parsedStartDate = Event.ParsingDate(dto.StartDate);
                if (!parsedStartDate.HasValue)
                    return Result<DistrictEvent>.Failure("Invalid StartDate.");
                startDate = parsedStartDate.Value;
            }

            DateTime? endDate = existingEvent.Event.EndDate;
            if (dto.EndDate is not null)
            {
                endDate = string.IsNullOrWhiteSpace(dto.EndDate)
                    ? null
                    : Event.ParsingDate(dto.EndDate);

                if (!string.IsNullOrWhiteSpace(dto.EndDate) && !endDate.HasValue)
                    return Result<DistrictEvent>.Failure("Invalid EndDate.");
            }

            if (endDate.HasValue && endDate.Value < startDate)
                return Result<DistrictEvent>.Failure("EndDate cannot be earlier than StartDate.");

            EventType eventType = existingEvent.Event.Type ?? EventType.Outro;
            if (dto.Type is not null)
                Enum.TryParse(dto.Type, true, out eventType);

            DistrictName district = existingEvent.District;
            if (dto.District is not null)
                Enum.TryParse(dto.District, true, out district);

            string? descriptionToCompute = dto.Description?.Trim() ?? existingEvent.Event.Description;
            string? locationToCompute = dto.Location?.Trim() ?? existingEvent.Event.Location;

            decimal qualityScore = EventQualityService.ComputeQualityScore(descriptionToCompute, startDate, locationToCompute, eventType);

            existingEvent.District = district;
            existingEvent.Event.Title = dto.Title?.Trim() ?? existingEvent.Event.Title;
            existingEvent.Event.Description = descriptionToCompute;
            existingEvent.Event.StartDate = startDate;
            existingEvent.Event.EndDate = endDate;
            existingEvent.Event.Location = locationToCompute;
            existingEvent.Event.SourceUrl = dto.SourceUrl?.Trim() ?? existingEvent.Event.SourceUrl;
            existingEvent.Event.Type = eventType;
            existingEvent.Event.QualityScore = qualityScore;

            await _eventsCollection.ReplaceOneAsync(e => e.Id == existingEvent.Id, existingEvent);

            Console.WriteLine("\nEvent successfully updated in storage!");
            return Result<DistrictEvent>.Success(existingEvent);
        }
        else
        {
            Console.WriteLine("\nEvent not found in storage!");
            return Result<DistrictEvent>.Failure("Event not found");
        }
    }

    public async Task<Result<DistrictEvent>> DeleteEvent(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return Result<DistrictEvent>.Failure("Invalid event id.");

        var districtEvent = await _eventsCollection.FindOneAndDeleteAsync(e => e.Id == id);
        if (districtEvent != null)
        {
            Console.WriteLine("\nEvent successfully deleted from storage!");
            return Result<DistrictEvent>.Success(districtEvent);
        }
        
        Console.WriteLine("\nEvent not found in storage!");
        return Result<DistrictEvent>.Failure("Event not found");
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

        var districtEvent = await _eventsCollection.Find(e => e.Id == id).FirstOrDefaultAsync();
        if (districtEvent != null)
        {
            return Result<DistrictEvent>.Success(districtEvent);
        }
        return Result<DistrictEvent>.Failure($"Event with id {id} not found.");
    }
}
