

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace Scrappy.Models;


public class CityEventMongo
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public Guid Id {get; set; } = Guid.NewGuid();

    [BsonElement("City Name")]
    public string CityName {get; set; } = string.Empty;

    [BsonElement("Event")]
    public Event Event {get; set; } = new();
}