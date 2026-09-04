

namespace Scrappy.DTOs.Responses;

/// <summary>
/// Represents a response DTO for event information, including properties such as ID, title, description,
/// alternate name, source URL, image URL, start date, end date, duration, quality score, type, status,
/// location, accessibility information, age rating, maximum attendee capacity, keywords, organizer, promoter,
/// performers, and schedule.
/// 
/// Example:
/// {
///   "id": "event123",
///   "title": "Sample Event Title",
///   "description": "This is a sample event description.",
///   "alternateName": "Sample Event",
///   "sourceUrl": "https://www.example.com/event",
///   "imageUrl": "https://www.example.com/event-image.jpg",
///   "startDate": "2024-06-01T09:00:00Z",
///   "endDate": "2024-06-01T17:00:00Z",
///   "duration": "PT8H",
///   "qualityScore": 85.5,
///   "type": "Workshop",
///   "status": "Scheduled",
///   "location": {
///     "locality": "Faro",
///     "district": "Algarve",
///     "region": "PT15",
///     "country": "PT",
///     "dicoCode": "PT15",
///     "latitude": 37.0194,
///     "longitude": -7.9304
///   },
///   "isAccessibleForFree": true,
///   "physicalAccessibility": true,
///   "ageRating": 12,
///   "maximumAttendeeCapacity": 100,
///   "keywords": ["workshop", "technology", "education"],
///   "organizer": {
///     "name": "Sample Organizer",
///     "type": "Organization",
///     "url": "https://www.example.com/organizer",
///     "sameAs": "https://www.example.com/organizer-profile"
///   },
///   "promoter": {
///     "name": "Sample Promoter",
///     "type": "Organization",
///     "url": "https://www.example.com/promoter",
///     "sameAs": "https://www.example.com/promoter-profile"
///   },
///   "performers": [
///     {
///       "name": "Sample Performer",
///       "type": "Person",
///       "url": "https://www.example.com/performer",
///       "sameAs": "https://www.example.com/performer-profile"
///     }
///   ],
///   "schedule": {
///     "startDate": "2024-06-01T09:00:00Z",
///     "endDate": "2024-06-01T17:00:00Z",
///     "duration": "PT8H"
///   }
/// }
/// </summary>
public class EventResponseDto
{
    /// <summary> Gets or sets the unique identifier of the event. </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary> Gets or sets the title of the event. </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary> Gets or sets the description of the event. </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary> Gets or sets the alternate name of the event. </summary>
    public string? AlternateName { get; set; }

    /// <summary> Gets or sets the source URL of the event. </summary>
    public string? SourceUrl { get; set; }

    /// <summary> Gets or sets the image URL of the event. </summary>
    public string? ImageUrl { get; set; }

    /// <summary> Gets or sets the start date and time of the event. </summary>
    public DateTime StartDate { get; set; }

    /// <summary> Gets or sets the end date and time of the event. </summary>
    public DateTime? EndDate { get; set; }

    /// <summary> Gets or sets the duration of the event in ISO 8601 format. </summary>
    public string? Duration { get; set; }

    /// <summary> Gets or sets the quality score of the event. </summary>
    public double QualityScore { get; set; }

    /// <summary> Gets or sets the type of the event. </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary> Gets or sets the status of the event. </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary> Gets or sets whether the event date has passed. </summary>
    public bool IsFinished { get; set; }

    /// <summary> Gets or sets the date after which the event can be removed. </summary>
    public DateTime? RetentionUntil { get; set; }

    /// <summary> Gets or sets the location information of the event. </summary>
    public EventLocationResponseDto? Location { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is accessible for free. </summary>
    public bool? IsAccessibleForFree { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is physically accessible. </summary>
    public bool PhysicalAccessibility { get; set; }

    /// <summary> Gets or sets the age rating of the event. </summary>
    public int? AgeRating { get; set; }

    /// <summary> Gets or sets the maximum attendee capacity of the event. </summary>
    public int? MaximumAttendeeCapacity { get; set; }

    /// <summary> Gets or sets the keywords associated with the event. </summary>
    public List<string> Keywords { get; set; } = new();

    /// <summary> Gets or sets the organizer information of the event. </summary>
    public List<EventAgentResponseDto> Organizer { get; set; } = new();

    /// <summary> Gets or sets the promoter information of the event. </summary>
    public List<EventAgentResponseDto> Promoter { get; set; } = new();

    /// <summary> Gets or sets the list of performers associated with the event. </summary>
    public List<EventAgentResponseDto> Performers { get; set; } = new();

    /// <summary> Gets or sets the list of actors associated with the event. </summary>
    public List<EventAgentResponseDto> Actor { get; set; } = new();
    
    /// <summary> Gets or sets the list of maintainers associated with the event. </summary>
    public List<EventAgentResponseDto> Composer { get; set; } = new();
    
    /// <summary> Gets or sets the list of directors associated with the event. </summary>
    public List<EventAgentResponseDto> Director { get; set; } = new();
    
    /// <summary> Gets or sets the list of maintainers associated with the event. </summary>
    public List<EventAgentResponseDto> Maintainer { get; set; } = new();
    
    /// <summary> Gets or sets the list of funders associated with the event. </summary>
    public List<EventAgentResponseDto> Funder { get; set; } = new();
    
    /// <summary> Gets or sets the list of audiences associated with the event. </summary>
    public List<EventAudienceResponseDto> Audience { get; set; } = new();

    /// <summary> Gets or sets the attendance mode of the event. </summary>
    public string? AttendanceMode { get; set; }

    /// <summary> Gets or sets the schedule information of the event. </summary>
    public EventScheduleResponseDto? Schedule { get; set; }

    /// <summary> Gets or sets the offers associated with the event. </summary>
    public List<EventOfferResponseDto> Offers { get; set; } = new();
}
