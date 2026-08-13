

using System.ComponentModel.DataAnnotations;
using Scrappy.Models.Entities;

namespace Scrappy.DTOs.Requests;

/// <summary>
/// Represents a request DTO for creating or updating an event schedule, including properties such as start date, end date, start time, end time, time zone, and repeat days.
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


public class EventScheduleRequestDto
{
    /// <summary> Gets or sets the start date of the event schedule. </summary>
    [Required]
    public DateTime StartDate { get; set; }

    /// <summary> Gets or sets the end date of the event schedule. </summary>
    public DateTime? EndDate { get; set; }

    /// <summary> Gets or sets the start time of the event schedule in HH:mm format. </summary>
    [RegularExpression(@"^([01]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Formato de hora inválido. Use HH:mm")]
    public string? StartTime { get; set; }

    /// <summary> Gets or sets the end time of the event schedule in HH:mm format. </summary>
    [RegularExpression(@"^([01]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Formato de hora inválido. Use HH:mm")]
    public string? EndTime { get; set; }

    /// <summary> Gets or sets the time zone of the event schedule. </summary>
    public string? TimeZone { get; set; } = "Europe/Lisbon";

    /// <summary> Gets or sets the days of the week when the event repeats. </summary>
    public List<DayOfWeek>? RepeatDays { get; set; }
}