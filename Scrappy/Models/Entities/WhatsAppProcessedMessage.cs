

using MongoDB.Bson.Serialization.Attributes;

namespace Scrappy.Models.Entities;


/// <summary>
/// Represents a processed WhatsApp message, including its unique identifier and the timestamp when it was sent.
/// </summary>
public sealed class WhatsAppProcessedMessage
{
    /// <summary> The name of the MongoDB collection that stores processed WhatsApp messages. </summary>
    public const string CollectionName = "WhatsAppProcessedMessages";

    /// <summary> Gets or sets the unique identifier of the processed WhatsApp message. </summary>
    [BsonId]
    public string MessageId { get; set; } = string.Empty;

    /// <summary> Gets or sets the timestamp when the message was sent. </summary>
    [BsonElement("RegisteredAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}