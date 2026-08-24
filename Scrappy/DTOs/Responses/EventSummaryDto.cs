

namespace Scrappy.DTOs.Responses;

/// <summary>
/// Represents a response DTO for event summary information, including properties such as ID, title, image URL, start date, type, locality, district, quality score, and accessibility status.
/// 
/// Example:
/// {
///   "id": "event123",
///   "title": "Sample Event Title",
///   "imageUrl": "https://www.example.com/event-image.jpg",
///   "startDate": "2024-06-01T09:00:00Z",
///   "type": "Workshop",
///   "locality": "Faro",
///   "district": "Algarve",
///   "qualityScore": 75.00,
///   "isAccessibleForFree": true
/// }
/// </summary>
public class EventSummaryDto
{
    /// <summary> Gets or sets the unique identifier of the event. </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary> Gets or sets the title of the event. </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary> Gets or sets the URL of the event's image. </summary>
    public string? ImageUrl { get; set; }

    /// <summary> Gets or sets the start date and time of the event. </summary>
    public DateTime StartDate { get; set; }

    /// <summary> Gets or sets the type of the event. </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary> Gets or sets the locality of the event. </summary>
    public string Locality { get; set; } = string.Empty;

    /// <summary> Gets or sets the district of the event. </summary>
    public string District { get; set; } = string.Empty;

    /// <summary> Gets or sets the quality score of the event. </summary>
    public double QualityScore { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is accessible for free. </summary>
    public bool? IsAccessibleForFree { get; set; }
}
