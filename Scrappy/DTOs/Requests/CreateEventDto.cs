

using System.ComponentModel.DataAnnotations;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.DTOs.Requests;

/// <summary>
/// DTO for creating a new event.
/// 
/// Example:
/// {
///   "title": "Sample Event",
///   "description": "This is a sample event description.",
///   "alternateName": "Sample Event Alt Name",
///   "startDate": "2024-06-01T10:00:00Z",
///   "endDate": "2024-06-01T12:00:00Z",
///   "doorTime": "2024-06-01T09:30:00Z",
///   "type": "Conference",
///   "location": {
///     "locality": "Faro",
///     "district": "Algarve",
///     "region": "PT15",
///     "country": "PT",
///     "dicoCode": "PT15",
///     "latitude": 37.0194,
///     "longitude": -7.9304
///   },
///   "sourceUrl": "https://www.example.com/event",
///   "imageUrl": "https://www.example.com/event-image.jpg",
///   "isAccessibleForFree": true,
///   "physicalAccessibility": true,
///   "ageRating": 12,
///   "maximumAttendeeCapacity": 100,
///   "keywords": ["sample", "event", "conference"],
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
///     "startDate": "2024-06-01T10:00:00Z",
///     "endDate": "2024-06-01T12:00:00Z",
///     "duration": "PT2H"
///   }
/// }
/// </summary>
public class CreateEventDto
{
    /// <summary> Gets or sets the title of the event. </summary>
    [Required(ErrorMessage = "O título do evento é obrigatório.")]
    [MinLength(3, ErrorMessage = "O título deve ter pelo menos 3 caracteres.")]
    public string Title { get; set; } = string.Empty;

    /// <summary> Gets or sets the description of the event. </summary>
    [Required(ErrorMessage = "A descrição do evento é obrigatória.")]
    [MinLength(10, ErrorMessage = "A descrição deve ter pelo menos 10 caracteres.")]
    public string Description { get; set; } = string.Empty;

    /// <summary> Gets or sets the alternate name of the event. </summary>
    public string? AlternateName { get; set; }

    /// <summary> Gets or sets the start date and time of the event. </summary>
    [Required(ErrorMessage = "A data de início é obrigatória.")]
    public DateTime StartDate { get; set; }

    /// <summary> Gets or sets the end date and time of the event. </summary>
    public DateTime? EndDate { get; set; }
    
    /// <summary> Gets or sets the door time of the event. </summary>
    public DateTime? DoorTime { get; set; }

    /// <summary> Gets or sets the type of the event. </summary>
    [Required(ErrorMessage = "O tipo do evento é obrigatório.")]
    public EventType? Type { get; set; }

    /// <summary> Gets or sets the location of the event. </summary>
    [Required(ErrorMessage = "A localização do evento é obrigatória.")]
    public EventLocationRequestDto Location { get; set; } = null!;

    /// <summary> Gets or sets the source URL of the event. </summary>
    [Required(ErrorMessage = "O URL de origem é obrigatório.")]
    [Url(ErrorMessage = "O URL fornecido não é válido.")]
    public string SourceUrl { get; set; } = string.Empty;

    /// <summary> Gets or sets the image URL of the event. </summary>
    public string? ImageUrl { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is accessible for free. </summary>
    public bool IsAccessibleForFree { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is physically accessible. </summary>
    public bool PhysicalAccessibility { get; set; }

    /// <summary> Gets or sets the age rating of the event. </summary>
    public int? AgeRating { get; set; }

    /// <summary> Gets or sets the maximum attendee capacity of the event. </summary>
    public int? MaximumAttendeeCapacity { get; set; }

    /// <summary> Gets or sets the keywords associated with the event. </summary>
    public List<string> Keywords { get; set; } = new();

    /// <summary> Gets or sets the organizer of the event. </summary>
    public EventAgentRequestDto? Organizer { get; set; }

    /// <summary> Gets or sets the promoter of the event. </summary>
    public EventAgentRequestDto? Promoter { get; set; }

    /// <summary> Gets or sets the performers of the event. </summary>
    public List<EventAgentRequestDto> Performers { get; set; } = new();

    /// <summary> Gets or sets the schedule of the event. </summary>
    public EventScheduleRequestDto? Schedule { get; set; }

    public List<EventOfferRequestDto> Offers { get; set; } = new();
}
