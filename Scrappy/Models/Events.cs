using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Globalization;

namespace Scrappy.Models;

public class Event
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("Title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("Description")]
    public string? Description { get; set; }
    
    [BsonElement("StartDate")]
    public DateTime StartDate { get; set; }
    
    [BsonElement("EndDate")]
    public DateTime? EndDate { get; set; }
    
    [BsonElement("Location")]
    public string? Location { get; set; }
    
    [BsonElement("SourceUrl")]
    public string SourceUrl { get; set; } = string.Empty;
    
    [BsonElement("Type")]
    [BsonRepresentation(BsonType.String)]
    public EventType? Type { get; set; }
    
    [BsonElement("QualityScore")]
    [BsonRepresentation(BsonType.Double)]
    public decimal QualityScore { get; set; }

    public static DateTime? ParsingDate(string input)
    {
        if (DateTime.TryParseExact(input, "yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
        {
            return parsedDate;
        }
        return null;
    }

    public static decimal ComputeQualityScore(string? description, DateTime? startDate, string? location, EventType? eventType)
    {
        int maxScore = 20;
        int earnedScore = 0;

        if (!string.IsNullOrEmpty(description) && description.Length >= 50)
            earnedScore += 5;

        if (startDate.HasValue)
            earnedScore += 5;

        if (!string.IsNullOrEmpty(location))
            earnedScore += 5;

        if (eventType.HasValue)
            earnedScore += 5;

        return (decimal)earnedScore / maxScore * 100;
    }
}

public enum EventType
{
    Concerto,
    Feira,
    Mercado,
    FestaPopular,
    Teatro,
    Festival,
    Exposição,
    Outro
}