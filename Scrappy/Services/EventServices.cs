
/// <summary>
/// Services files are for business logic, they are not for API endpoints. Processes raw data from controller
/// and returns the processed data to the controller. 
/// 
/// 
/// The EventService class provides functionality for managing events associated with different cities. 
/// It includes methods for adding new events to an in-memory storage and retrieving all stored events. 
/// The service utilizes a dictionary to efficiently store and manage CityEvent objects, allowing for quick access and manipulation of event data. 
/// The AddEvent method handles the parsing of event details, computation of quality scores, and creation of CityEvent objects, 
/// while the GetAllEvents method provides a way to retrieve all stored events for further processing or display.
/// </summary>
using Scrappy.Models;
using Scrappy.DTOs;
using Scrappy.Common;
using Scrappy.Exceptions;
using Scrappy.Services;

namespace Scrappy.Services;
public class EventService
{
    private readonly static Dictionary<Guid, DistrictEvent> _storage = [];

    public Result<DistrictEvent> AddEvent(CreateEventDto dto)
    {

        if (!Validator.IsTitleValid(dto.Title))
                return Result<DistrictEvent>.Failure("Invalid Title.");

        if (!Validator.AreDatesValid(dto.StartDate, dto.EndDate))
            return Result<DistrictEvent>.Failure("Invalid StartDate or EndDate.");

        if (!Validator.IsDistrictValid(dto.District))
            return Result<DistrictEvent>.Failure("Invalid District.");

        if (Validator.IsDuplicateOnCreate(dto, this))
        {
            return Result<DistrictEvent>.Failure("An event with the same District, Title, and StartDate already exists.");
        }  

        DateTime? startDate = Event.ParsingDate(dto.StartDate);
        DateTime? endDate = string.IsNullOrEmpty(dto.EndDate) ? null : Event.ParsingDate(dto.EndDate);

        Enum.TryParse<DistrictName>(dto.District, true, out DistrictName district);
        Enum.TryParse<EventType>(dto.Type, true, out EventType eventType);

        string cleanTitle = dto.Title.Trim();
        string? cleanDescription = dto.Description?.Trim();
        string? cleanLocation = dto.Location?.Trim();
        string? cleanSourceUrl = dto.SourceUrl?.Trim();

        decimal qualityScore = EventQualityService.ComputeQualityScore(cleanDescription, cleanLocation, eventType, startDate); 

        DistrictEvent districtEvent = new()
        {
            Id = Guid.NewGuid(),
            District = district,
            Event = new Event{
                Id = Guid.NewGuid(),
                Title = cleanTitle,
                Description = cleanDescription,
                StartDate = startDate ?? DateTime.MinValue,
                EndDate = endDate,
                Location = cleanLocation,
                SourceUrl = cleanSourceUrl,
                Type = eventType,
                QualityScore = qualityScore
            },
        };


        _storage[districtEvent.Id] = districtEvent;
        return Result<DistrictEvent>.Success(districtEvent);
    }

    public Result<DistrictEvent> UpdateEvent(UpdateEventDto dto)
    {
        if (_storage.TryGetValue(dto.Id, out DistrictEvent? existingEvent))
        {

            DateTime? startDate = string.IsNullOrEmpty(dto.StartDate) ? existingEvent.Event.StartDate : Event.ParsingDate(dto.StartDate);
            DateTime? endDate = string.IsNullOrEmpty(dto.EndDate) ? existingEvent.Event.EndDate : Event.ParsingDate(dto.EndDate);
            EventType eventType = existingEvent.Event.Type ?? EventType.Outro;
            if (!string.IsNullOrEmpty(dto.Type))
            {
                Enum.TryParse<EventType>(dto.Type, true, out eventType);
            }
            DistrictName district = existingEvent.District;
            if (!string.IsNullOrEmpty(dto.District))
            {
                Enum.TryParse<DistrictName>(dto.District, true, out district);
            }

            string? descriptionToCompute = dto.Description ?? existingEvent.Event.Description;
            string? locationToCompute = dto.Location ?? existingEvent.Event.Location;

            decimal qualityScore = EventQualityService.ComputeQualityScore(descriptionToCompute, startDate, locationToCompute, eventType);

            existingEvent.District = district;
            existingEvent.Event.Title = dto.Title ?? existingEvent.Event.Title;
            existingEvent.Event.Description = descriptionToCompute;
            existingEvent.Event.StartDate = startDate ?? DateTime.MinValue;
            existingEvent.Event.EndDate = endDate;
            existingEvent.Event.Location = locationToCompute;
            existingEvent.Event.SourceUrl = dto.SourceUrl ?? existingEvent.Event.SourceUrl;
            existingEvent.Event.Type = eventType;
            existingEvent.Event.QualityScore = qualityScore;

            Console.WriteLine("\nEvent successfully updated in storage!");
            return Result<DistrictEvent>.Success(existingEvent);
        }
        else
        {
            Console.WriteLine("\nEvent not found in storage!");
            return Result<DistrictEvent>.Failure("Event not found");
        }
    }

    public Result<DistrictEvent> DeleteEvent(Guid id)
    {
        if (_storage.Remove(id, out DistrictEvent? districtEvent))
        {
            Console.WriteLine("\nEvent successfully deleted from storage!");
            return Result<DistrictEvent>.Success(districtEvent);
        }
        
        Console.WriteLine("\nEvent not found in storage!");
        return Result<DistrictEvent>.Failure("Event not found");
    }
    public Result<IEnumerable<DistrictEvent>> GetAllEvents()
    {
        return Result<IEnumerable<DistrictEvent>>.Success(_storage.Values);
    }
    public Result<DistrictEvent> GetEventById(Guid id)
    {
        if (_storage.TryGetValue(id, out DistrictEvent? districtEvent))
        {
            return Result<DistrictEvent>.Success(districtEvent);
        }
        return Result<DistrictEvent>.Failure($"Event with id {id} not found.");
    }
}

