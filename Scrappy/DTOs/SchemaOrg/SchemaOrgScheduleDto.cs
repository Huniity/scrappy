


using Scrappy.Models;
using Scrappy.Models.Entities;
using System.Text.Json.Serialization;

namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents the schedule information for an event in the Schema.org format. This class is used to define the start and end dates of an event, as well as its recurrence pattern if applicable.
/// 
/// Example:
/// {
///   "@type": "Schedule",
///   "startDate": "2024-06-01",
///   "endDate": "2024-06-30",
///   "startTime": "09:00",
///   "endTime": "17:00",
///   "scheduleTimezone": "Europe/Lisbon",
///   "byDay": ["Monday", "Wednesday", "Friday"]
/// </summary>
public class SchemaOrgScheduleDto
{
    /// <summary> Gets or sets the type of the schedule, which is always "Schedule" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "Schedule";

    /// <summary> Gets or sets the start date of the event in the format "YYYY-MM-DD". </summary>
    [JsonPropertyName("startDate")]
    public string StartDate { get; set; } = string.Empty;

    /// <summary> Gets or sets the end date of the event in the format "YYYY-MM-DD". </summary>
    [JsonPropertyName("endDate")]
    public string? EndDate { get; set; }

    /// <summary> Gets or sets the start time of the event in the format "HH:MM". </summary>
    [JsonPropertyName("startTime")]
    public string? StartTime { get; set; }

    /// <summary> Gets or sets the end time of the event in the format "HH:MM". </summary>
    [JsonPropertyName("endTime")]
    public string? EndTime { get; set; }

    /// <summary> Gets or sets the timezone of the schedule, which is always "Europe/Lisbon" for this DTO. </summary>
    [JsonPropertyName("scheduleTimezone")]
    public string ScheduleTimezone { get; set; } = "Europe/Lisbon";

    /// <summary> Gets or sets the days of the week on which the event occurs, represented as a list of strings (e.g., "Monday", "Tuesday"). </summary>
    [JsonPropertyName("byDay")]
    public List<string>? ByDay { get; set; }
}