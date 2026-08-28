

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Models.Entities;

/// <summary>
/// Represents the location where an event takes place, including address and geographical information.
/// </summary>
public class EventLocation
{
    /// <summary> Gets or sets the name of the event location. </summary>
    [BsonElement("Name")]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the locality of the event location. </summary>
    [BsonElement("Locality")]
    [BsonRepresentation(BsonType.String)]
    public LocalityName Locality { get; set; }

    /// <summary> Gets or sets the district of the event location. </summary>
    [BsonElement("District")]
    [BsonRepresentation(BsonType.String)]
    public DistrictName? District { get; set; }

    /// <summary> Gets or sets the NUTS2 region of the event location. </summary>
    [BsonElement("Region")]
    [BsonRepresentation(BsonType.String)]
    public Nuts2Region Region { get; set; }

    /// <summary> Gets or sets the country of the event location. </summary>
    [BsonElement("Country")]
    public string Country { get; set; } = "PT";

    /// <summary> Gets or sets the DICO code of the event location. </summary>
    [BsonElement("DicoCode")]
    public string? DicoCode { get; set; }

    /// <summary> Gets or sets the street address of the event location. </summary>
    [BsonElement("Url")]
      public string? Url { get; set; }

    /// <summary> Gets or sets the street address of the event location. </summary>
    [BsonElement("SameAs")]
    public string? SameAs { get; set; }

    /// <summary> Gets or sets the latitude of the event location in decimal degrees. </summary>
    [BsonElement("Latitude")]
    public double? Latitude { get; set; }

    /// <summary> Gets or sets the longitude of the event location in decimal degrees. </summary>
    [BsonElement("Longitude")]
    public double? Longitude { get; set; }
}
