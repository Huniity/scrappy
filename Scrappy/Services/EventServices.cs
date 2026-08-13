using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.Common;
using Scrappy.DTOs.Requests;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Validators;
using System.Globalization;

namespace Scrappy.Services;

public class EventService(IMongoDatabase database)
{
    private readonly IMongoCollection<DistrictEvent> _eventsCollection =
        database.GetCollection<DistrictEvent>("DistrictEvents");

    public async Task<Result<DistrictEvent>> AddEvent(CreateEventDto dto)
    {
        if (!await Validator.IsTitleValidAndAvailable(dto.Title, this))
            return Result<DistrictEvent>.Failure("Invalid or unavailable title.");

        if (!Validator.IsDescriptionValid(dto.Description))
            return Result<DistrictEvent>.Failure("Invalid description.");

        if (!Validator.AreDatesValid(dto.StartDate, dto.EndDate))
            return Result<DistrictEvent>.Failure("Invalid start or end date.");

        if (!Validator.IsTypeValid(dto.Type))
            return Result<DistrictEvent>.Failure("Invalid event type.");

        if (!Validator.IsLocationValid(dto.Location))
            return Result<DistrictEvent>.Failure("Invalid location.");

        if (!Validator.IsSourceUrlValid(dto.SourceUrl))
            return Result<DistrictEvent>.Failure("Invalid source URL.");

        if (await Validator.IsDuplicateOnCreate(dto, this))
        {
            return Result<DistrictEvent>.Failure(
                "An event with the same district, title, and start date already exists.");
        }

        var cleanDescription = dto.Description.Trim();
        var cleanLocation = dto.Location.Name.Trim();
        var qualityScore = EventQualityService.ComputeQualityScore(
            cleanDescription,
            dto.StartDate,
            cleanLocation,
            dto.Type);

        var districtEvent = new DistrictEvent
        {
            Id = ObjectId.GenerateNewId().ToString(),
            District = dto.Location.District,
            Event = new Event
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Title = dto.Title.Trim(),
                Description = cleanDescription,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Location = MapLocation(dto.Location),
                SourceUrl = dto.SourceUrl.Trim(),
                Type = dto.Type,
                Organizer = MapAgent(dto.Organizer),
                Promoter = MapAgent(dto.Promoter),
                Performers = MapAgents(dto.Performers),
                QualityScore = qualityScore
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

        if (dto.Title is not null &&
            !await Validator.IsTitleValidAndAvailable(dto.Title, this, id))
        {
            return Result<DistrictEvent>.Failure("Invalid or unavailable title.");
        }

        if (dto.Description is not null &&
            !Validator.IsDescriptionValid(dto.Description))
        {
            return Result<DistrictEvent>.Failure("Invalid description.");
        }

        if (dto.Type.HasValue && !Validator.IsTypeValid(dto.Type.Value))
            return Result<DistrictEvent>.Failure("Invalid event type.");

        if (dto.Location is not null && !Validator.IsLocationValid(dto.Location))
            return Result<DistrictEvent>.Failure("Invalid location.");

        if (dto.SourceUrl is not null &&
            !Validator.IsSourceUrlValid(dto.SourceUrl))
        {
            return Result<DistrictEvent>.Failure("Invalid source URL.");
        }

        if (dto.Organizer is not null)
            existingEvent.Event.Organizer = MapAgent(dto.Organizer);

        if (dto.Promoter is not null)
            existingEvent.Event.Promoter = MapAgent(dto.Promoter);

        if (dto.Performers is not null)
            existingEvent.Event.Performers = MapAgents(dto.Performers);

        var startDate = dto.StartDate ?? existingEvent.Event.StartDate;
        var endDate = dto.EndDate ?? existingEvent.Event.EndDate;

        if (!Validator.AreDatesValid(startDate, endDate))
            return Result<DistrictEvent>.Failure("Invalid start or end date.");

        var eventType = dto.Type ?? existingEvent.Event.Type ?? EventType.Outro;
        var description = dto.Description?.Trim() ?? existingEvent.Event.Description;
        var location = dto.Location is null
            ? existingEvent.Event.Location
            : MapLocation(dto.Location);
        var locationName = location?.Name;

        existingEvent.District = location?.District ?? existingEvent.District;
        existingEvent.Event.Title = dto.Title?.Trim() ?? existingEvent.Event.Title;
        existingEvent.Event.Description = description;
        existingEvent.Event.StartDate = startDate;
        existingEvent.Event.EndDate = endDate;
        existingEvent.Event.Location = location;
        existingEvent.Event.SourceUrl = dto.SourceUrl?.Trim() ?? existingEvent.Event.SourceUrl;
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

    private static EventLocation MapLocation(EventLocationRequestDto dto) => new()
    {
        Name = dto.Name.Trim(),
        Locality = dto.Locality,
        District = dto.District,
        Region = dto.Region,
        Country = dto.Country.Trim(),
        DicoCode = dto.DicoCode?.Trim(),
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

    private static AgentModel? MapAgent(EventAgentRequestDto? dto)
    {
        if (dto is null)
            return null;

        return new AgentModel
        {
            Name = dto.Name.Trim(),
            Type = dto.Type,
            Url = dto.Url?.Trim(),
            SameAs = dto.SameAs?.Trim()
        };
    }

    private static List<AgentModel> MapAgents(
        IEnumerable<EventAgentRequestDto>? agents)
    {
        return agents?
            .Select(MapAgent)
            .Where(agent => agent is not null)
            .Cast<AgentModel>()
            .ToList() ?? new();
    }
}
