

namespace Scrappy.DTOs.Responses;

/// <summary>
/// Represents a response DTO for event schedule information, including properties such as start date, end date, start time, end time, time zone, and repeat days.
/// 
/// Example:
/// {
///   "startDate": "2024-06-01",
///   "endDate": "2024-06-30",
///   "startTime": "09:00",
///   "endTime": "17:00",
///   "timeZone": "Europe/Lisbon",
///   "repeatDays": ["Monday", "Wednesday", "Friday"]
/// }
/// </summary>
public class EventScheduleResponseDto
{
    /// <summary> Gets or sets the start date of the event schedule. </summary>
    public DateTime StartDate { get; set; }

    /// <summary> Gets or sets the end date of the event schedule. </summary>
    public DateTime? EndDate { get; set; }

    /// <summary> Gets or sets the start time of the event schedule in HH:mm format. </summary>
    public string? StartTime { get; set; }

    /// <summary> Gets or sets the end time of the event schedule in HH:mm format. </summary>
    public string? EndTime { get; set; }

    /// <summary> Gets or sets the time zone of the event schedule. </summary>
    public string TimeZone { get; set; } = "Europe/Lisbon";

    /// <summary> Gets or sets the days of the week when the event repeats. </summary>
    public List<string>? RepeatDays { get; set; }
}