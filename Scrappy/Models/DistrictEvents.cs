

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using Scrappy.Models.Entities;


namespace Scrappy.Models;


public class DistrictEvent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("DistrictName")]
    [BsonRepresentation(BsonType.String)]
    public DistrictName District { get; set; }

    [BsonElement("Event")]
    public Event Event { get; set; } = new();
}