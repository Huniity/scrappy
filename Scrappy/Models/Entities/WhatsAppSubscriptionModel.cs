

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace Scrappy.Models.Entities;

/// <summary>
/// Represents a subscription to WhatsApp notifications for a specific locality.
/// </summary>
public sealed class WhatsAppSubscriptionModel
{
    /// <summary> The name of the MongoDB collection where WhatsApp subscriptions are stored. </summary>
    public const string CollectionName = "WhatsAppSubscriptions";

    /// <summary> Gets or sets the unique identifier for the subscription. </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary> Gets or sets the WhatsApp user ID associated with the subscription. </summary>
    [BsonElement("WhatsAppUserId")]
    public string WhatsAppUserId { get; set; } = string.Empty;

    /// <summary> Gets or sets the slug representing the locality for which the user is subscribed to notifications. </summary>
    [BsonElement("LocalitySlug")]
    public string LocalitySlug { get; set; } = string.Empty;

    /// <summary> Gets or sets the name of the locality for which the user is subscribed to notifications. </summary>
    [BsonElement("IsActive")]
    public bool IsActive { get; set; }

    /// <summary> Gets or sets the UTC timestamp when the subscription was created. </summary>
    [BsonElement("CreatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary> Gets or sets the UTC timestamp when the subscription was last updated. </summary>
    [BsonElement("UpdatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}