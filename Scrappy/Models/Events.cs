using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System;
using System.Globalization;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Models;

/// <summary>
/// Represents an event with various properties such as title, description, dates, location, source URL, type, and quality score.
/// </summary>
public class Event
{
    /// <summary> Gets or sets the unique identifier for the event. </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary> Gets or sets the title of the event. </summary>
    [BsonElement("Title")]
    public string Title { get; set; } = string.Empty;

    /// <summary> Gets or sets the description of the event. </summary>
    [BsonElement("Description")]
    public string Description { get; set; } = string.Empty;
    
    /// <summary> Gets or sets the start date of the event. </summary>
    [BsonElement("StartDate")]
    public DateTime StartDate { get; set; }
    
    /// <summary> Gets or sets the end date of the event. </summary>
    [BsonElement("EndDate")]
    public DateTime? EndDate { get; set; }
    
    /// <summary> Gets or sets the location of the event. </summary>
    [BsonElement("Location")]
    public EventLocation? Location { get; set; }
    
    /// <summary> Gets or sets the source URL of the event. </summary>
    [BsonElement("SourceUrl")]
    public string SourceUrl { get; set; } = string.Empty;

    /// <summary>Gets all source URLs contributing data to a merged event.</summary>
    [BsonElement("SourceUrls")]
    public List<string> SourceUrls { get; set; } = new();
    
    /// <summary> Gets or sets the type of the event. </summary>
    [BsonElement("Type")]
    [BsonRepresentation(BsonType.String)]
    public EventType? Type { get; set; }
    
    /// <summary> Gets or sets the quality score of the event, which is a decimal value representing the quality of the event based on various factors. </summary>
    [BsonElement("QualityScore")]
    [BsonRepresentation(BsonType.Double)]
    public decimal QualityScore { get; set; }

    /// <summary> Parses a date string in the format "yyyy-MM-dd HH:mm" and returns a nullable DateTime object. If the input string is not in the correct format, it returns null. </summary>
    /// <param name="input">The date string to parse.</param>
    /// <returns>The parsed DateTime object or null if parsing fails.</returns>
    public static DateTime? ParsingDate(string input)
    {
        if (DateTime.TryParseExact(input, "yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
        {
            return parsedDate;
        }
        return null;
    }

    /// <summary> Computes the quality score of an event based on its description, start date, location, and type. The score is calculated as a percentage of the maximum possible score (20 points). </summary>
    /// <param name="description">The description of the event.</param>
    /// <param name="startDate">The start date of the event.</param>
    /// <param name="location">The location of the event.</param>
    /// <param name="eventType">The type of the event.</param>
    /// <returns>The computed quality score as a decimal value.</returns>
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

    /// <summary> Gets or sets an alternative name for the event. </summary>
    [BsonElement("AlternateName")]
    public string AlternateName { get; set; } = string.Empty;

    /// <summary> Gets or sets the door opening time of the event. </summary>
    [BsonElement("DoorTime")]
    public DateTime? DoorTime { get; set; }

    /// <summary> Gets or sets the URL of the event image. </summary>
    [BsonElement("ImageUrl")]
    public string ImageUrl { get; set; } = string.Empty;

    /// <summary> Gets or sets a value indicating whether the event is accessible for free. </summary>
    [BsonElement("IsAccessibleForFree")]
    public bool? IsAccessibleForFree { get; set; }

    /// <summary> Gets or sets a value indicating whether the event is physically accessible. </summary>
    [BsonElement("PhysicalAccessibility")]
    public bool PhysicalAccessibility { get; set; }

    /// <summary> Gets or sets the recommended minimum age rating for the event. </summary>
    [BsonElement("AgeRating")]
    public int? AgeRating { get; set; }

    /// <summary> Gets or sets the maximum number of attendees for the event. </summary>
    [BsonElement("MaximumAttendeeCapacity")]
    public int? MaximumAttendeeCapacity { get; set; }

    /// <summary> Gets or sets the keywords associated with the event. </summary>
    [BsonElement("Keywords")]
    public List<string> Keywords { get; set; } = new List<string>();

    /// <summary> Gets or sets the organizer of the event. </summary>
    [BsonElement("Organizer")]
    public List<AgentModel> Organizer { get; set; } = new();

    /// <summary> Gets or sets the promoter of the event. </summary>
    [BsonElement("Promoter")]
    public List<AgentModel> Promoter { get; set; } = new();

    /// <summary> Gets or sets the performers associated with the event. </summary>
    [BsonElement("Performers")]
    public List<AgentModel> Performers { get; set; } = new();

    /// <summary> Gets or sets the maintainers of the event. </summary>
    [BsonElement("Maintainer")]
    public List<AgentModel> Maintainer { get; set; } = new();

    /// <summary> Gets or sets the funders of the event. </summary>
    [BsonElement("Funder")]
    public List<AgentModel> Funder { get; set; } = new();

    /// <summary> Gets or sets the actors of the event. </summary>
    [BsonElement("Actor")]
    public List<AgentModel> Actor { get; set; } = new();

    /// <summary> Gets or sets the directors of the event. </summary>
    [BsonElement("Director")]
    public List<AgentModel> Director { get; set; } = new();

    /// <summary> Gets or sets the producers of the event. </summary>
    [BsonElement("Composer")]
    public List<AgentModel> Composer { get; set; } = new();

    /// <summary> Gets or sets the audience associated with the event. </summary>
    [BsonElement("AudienceType")]
    public List<AudienceModel> Audience { get; set; } = new();

    /// <summary> Gets or sets the attendance mode of the event. </summary>
    [BsonElement("EventAttendanceMode")]
    [BsonRepresentation(BsonType.String)]
    public EventAttendanceMode? AttendanceMode { get; set; }

    /// <summary> Gets or sets the schedule of the event. </summary>
    [BsonElement("Schedule")]
    public ScheduleModel? Schedule { get; set; }

    /// <summary> Gets or sets the current status of the event. </summary>
    [BsonElement("Status")]
    public EventStatus Status { get; set; } = EventStatus.Scheduled;

    /// <summary> Gets or sets the duration of the event in ISO 8601 format. </summary>
    [BsonElement("Duration")]
    public string? Duration { get; set; }

    /// <summary> Gets or sets the offers associated with the event. </summary>
    [BsonElement("Offers")]
    public List<OfferModel> Offers { get; set; } = new();


}
