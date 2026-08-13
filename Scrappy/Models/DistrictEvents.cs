

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using Scrappy.Models.Entities;


namespace Scrappy.Models;

/// <summary>
/// Represents a district event, which is an association between a district and an event.
/// </summary>
public class DistrictEvent
{
    /// <summary> Gets or sets the unique identifier for the district event. </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary> Gets or sets the district associated with the event. </summary>
    [BsonElement("DistrictName")]
    [BsonRepresentation(BsonType.String)]
    public DistrictName District { get; set; }

    /// <summary> Gets or sets the event associated with the district. </summary>
    [BsonElement("Event")]
    public Event Event { get; set; } = new();
}