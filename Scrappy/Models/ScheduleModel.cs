using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Scrappy.Models;

public class ScheduleModel
{
    [BsonElement("StartDate")]
    public DateTime StartDate { get; set; }

    [BsonElement("EndDate")]
    public DateTime? EndDate { get; set; }

    [BsonElement("StartTime")]
    public string? StartTime { get; set; }

    [BsonElement("EndTime")]
    public string? EndTime { get; set; }

    [BsonElement("TimeZone")]
    public string TimeZone { get; set; } = "Europe/Lisbon";

    [BsonElement("RepeatDays")]
    public List<DayOfWeek>? RepeatDays { get; set; }
}
