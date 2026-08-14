

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Scrappy.Models.Entities;

/// <summary>
/// Represents the schedule of an event, including its dates, times, time zone, and recurrence days.
/// </summary>
public class ScheduleModel
{
    /// <summary> Gets or sets the start date of the event schedule. </summary>
    [BsonElement("StartDate")]
    public DateTime StartDate { get; set; }

    /// <summary> Gets or sets the end date of the event schedule. </summary>
    [BsonElement("EndDate")]
    public DateTime? EndDate { get; set; }

    /// <summary> Gets or sets the start time of the event schedule in HH:mm format. </summary>
    [BsonElement("StartTime")]
    public string? StartTime { get; set; }

    /// <summary> Gets or sets the end time of the event schedule in HH:mm format. </summary>
    [BsonElement("EndTime")]
    public string? EndTime { get; set; }

    /// <summary> Gets or sets the time zone of the event schedule. </summary>
    [BsonElement("TimeZone")]
    public string TimeZone { get; set; } = "Europe/Lisbon";

    /// <summary> Gets or sets the days of the week on which the event repeats. </summary>
    [BsonElement("RepeatDays")]
    public List<DayOfWeek>? RepeatDays { get; set; }
}
