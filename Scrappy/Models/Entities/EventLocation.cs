

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Models.Entities;

public class EventLocation
{
    [BsonElement("Name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("Locality")]
    [BsonRepresentation(BsonType.String)]
    public LocalityName Locality { get; set; }

    [BsonElement("District")]
    [BsonRepresentation(BsonType.String)]
    public DistrictName District { get; set; }

    [BsonElement("Region")]
    [BsonRepresentation(BsonType.String)]
    public Nuts2Region Region { get; set; }

    [BsonElement("Country")]
    public string Country { get; set; } = "PT";

    [BsonElement("DicoCode")]
    public string? DicoCode { get; set; }

    [BsonElement("Latitude")]
    public double? Latitude { get; set; }

    [BsonElement("Longitude")]
    public double? Longitude { get; set; }
}
