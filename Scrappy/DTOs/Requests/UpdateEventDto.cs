

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.DTOs.Requests;

/// <summary>
/// DTO for updating an existing event.
/// 
/// Example:
/// {
///   "title": "Updated Event Title",
///   "description": "Updated event description.",
///   "alternateName": "Updated Event Alt Name",
///   "startDate": "2024-06-02T10:00:00Z",
///   "endDate": "2024-06-02T12:00:00Z",
///   "doorTime": "2024-06-02T09:30:00Z",
///   "type": "Workshop",
///   "location": {
///     "locality": "Faro",
///     "district": "Algarve",
///     "region": "PT15",
///     "country": "PT",
///     "dicoCode": "PT15",
///     "latitude": 37.0194,
///     "longitude": -7.9304
///   },
///   "sourceUrl": "https://www.example.com/updated-event",
///   "imageUrl": "https://www.example.com/updated-event-image.jpg",
///   "isAccessibleForFree": false,
///   "physicalAccessibility": false,
///   "ageRating": 16,
///   "maximumAttendeeCapacity": 150,
///   "keywords": ["updated", "event", "workshop"],
///   "organizer": {
///     "name": "Updated Organizer",
///     "type": "Organization",
///     "url": "https://www.example.com/updated-organizer",
///     "sameAs": "https://www.example.com/updated-organizer-profile"
///   },
///   "promoter": {
///     "name": "Updated Promoter",
///     "type": "Organization",
///     "url": "https://www.example.com/updated-promoter",
///     "sameAs": "https://www.example.com/updated-promoter-profile"
///   },
///   "performers": [
///     {
///       "name": "Updated Performer",
///       "type": "Person",
///       "url": "https://www.example.com/updated-performer",
///       "sameAs": "https://www.example.com/updated-performer-profile"
///     }
///   ],
///   "schedule": {
///     "startDate": "2024-06-02T10:00:00Z",
///     "endDate": "2024-06-02T12:00:00Z",
///     "duration": "PT2H"
///   }
/// }
/// </summary>
public class UpdateEventDto
{
    /// <summary> Gets or sets the title of the event. </summary>
    [MinLength(3, ErrorMessage = "O título deve ter pelo menos 3 caracteres.")]
    public string? Title { get; set; }

    /// <summary> Gets or sets the description of the event. </summary>
    [MinLength(10, ErrorMessage = "A descrição deve ter pelo menos 10 caracteres.")]
    public string? Description { get; set; }

    /// <summary> Gets or sets the alternate name of the event. </summary>
    public string? AlternateName { get; set; }

    /// <summary> Gets or sets the start date and time of the event. </summary>
    public DateTime? StartDate { get; set; }

    /// <summary> Gets or sets the end date and time of the event. </summary>
    public DateTime? EndDate { get; set; }

    /// <summary> Gets or sets the door time of the event. </summary>
    public DateTime? DoorTime { get; set; }

    /// <summary> Gets or sets the type of the event. </summary>
    public string? Duration { get; set; }

    /// <summary> Gets or sets the type of the event. </summary>
    public EventType? Type { get; set; }

    /// <summary> Gets or sets the location of the event. </summary>
    public EventLocationRequestDto? Location { get; set; }

    /// <summary> Gets or sets the source URL of the event. </summary>
    [Url(ErrorMessage = "O URL fornecido não é válido.")]
    public string? SourceUrl { get; set; }

    /// <summary> Gets or sets the image URL of the event. </summary>
    public string? ImageUrl { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is accessible for free. </summary>
    public bool? IsAccessibleForFree { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is physically accessible. </summary>
    public bool? PhysicalAccessibility { get; set; }

    /// <summary> Gets or sets the age rating for the event. </summary>
    public int? AgeRating { get; set; }

    /// <summary> Gets or sets the maximum attendee capacity for the event. </summary>
    public int? MaximumAttendeeCapacity { get; set; }

    /// <summary> Gets or sets the keywords associated with the event. </summary>
    public List<string>? Keywords { get; set; }

    /// <summary> Gets or sets the organizer of the event. </summary>
    public List<EventAgentRequestDto>? Organizer { get; set; }

    /// <summary> Gets or sets the maintainer of the event. </summary>
    public List<EventAgentRequestDto>? Maintainer { get; set; }

    /// <summary> Gets or sets the funder of the event. </summary>
    public List<EventAgentRequestDto>? Funder { get; set; }

    /// <summary> Gets or sets the composer of the event. </summary>
    public List<EventAgentRequestDto>? Composer { get; set; }

    /// <summary> Gets or sets the director of the event. </summary>
    public List<EventAgentRequestDto>? Director { get; set; }

    /// <summary> Gets or sets the promoter of the event. </summary>
    public List<EventAgentRequestDto>? Promoter { get; set; }

    /// <summary> Gets or sets the actor of the event. </summary>
    public List<EventAgentRequestDto>? Actor { get; set; }

    /// <summary> Gets or sets the performers of the event. </summary>
    public List<EventAgentRequestDto>? Performers { get; set; }

    /// <summary> Gets or sets the audience of the event. </summary>
    public List<EventAudienceRequestDto>? Audience { get; set; }

    /// <summary> Gets or sets the attendance mode of the event. </summary>
    [JsonPropertyName("eventAttendanceMode")]
    public EventAttendanceMode? AttendanceMode { get; set; }

    /// <summary> Gets or sets the schedule of the event. </summary>
    public EventScheduleRequestDto? Schedule { get; set; }

    /// <summary> Gets or sets the attendance mode of the event. </summary>
    public List<EventOfferRequestDto>? Offers { get; set; }
}