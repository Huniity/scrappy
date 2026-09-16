

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Scrappy.Models.Entities;

/// <summary>
/// Status of a weekly WhatsApp template Report.
/// </summary>
public enum WhatsAppWeeklyReportStatus
{
    Processing,
    Sent,
    Failed
}

/// <summary>
/// Records the weekly template Report for one user, locality and week.
/// </summary>
public sealed class WhatsAppWeeklyReport
{
    /// <summary> Gets the name of the MongoDB collection for this entity. </summary>
    public const string CollectionName = "WhatsAppWeeklyReport";

    /// <summary> Gets or sets the unique identifier of the Report. </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary> Gets or sets the WhatsApp user identifier. </summary>
    [BsonElement("WhatsAppUserId")]
    public string WhatsAppUserId { get; set; } = string.Empty;

    /// <summary> Gets or sets the locality slug. </summary>
    [BsonElement("LocalitySlug")]
    public string LocalitySlug { get; set; } = string.Empty;

    /// <summary> Gets or sets the start of the week in UTC. </summary>
    [BsonElement("WeekStartUtc")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime WeekStartUtc { get; set; }

    /// <summary> Gets or sets the status of the Report. </summary>
    [BsonElement("Status")]
    [BsonRepresentation(BsonType.String)]
    public WhatsAppWeeklyReportStatus Status { get; set; }

    /// <summary> Gets or sets the number of attempts to send the Report. </summary>
    [BsonElement("AttemptCount")]
    public int AttemptCount { get; set; }

    /// <summary> Gets or sets the ID of the lease for the Report. </summary>
    [BsonElement("LeaseId")]
    public string? LeaseId { get; set; }

    /// <summary> Gets or sets the UTC timestamp of the last attempt to send the Report. </summary>
    [BsonElement("LeaseUntilUtc")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? LeaseUntilUtc { get; set; }

    /// <summary> Gets or sets the UTC timestamp when the Report was created. </summary>
    [BsonElement("CreatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; }

    /// <summary> Gets or sets the UTC timestamp when the Report was last updated. </summary>
    [BsonElement("UpdatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; }

    /// <summary> Gets or sets the UTC timestamp when the Report was sent. </summary>
    [BsonElement("SentAtUtc")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? SentAtUtc { get; set; }
}