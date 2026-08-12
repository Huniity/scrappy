


using Scrappy.Models;
using Scrappy.Models.Entities;
using System.Text.Json.Serialization;

namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents the geographical information for an event in the Schema.org format. This class is used to define the location of an event, including its latitude and longitude coordinates.
/// 
/// Exmple:
/// {
///   "@type": "GeoCoordinates",
///   "latitude": 40.7128,
///   "longitude": -74.0060
/// }
/// </summary>
public class SchemaOrgGeoDto
{
    /// <summary> Gets or sets the type of the geographical information, which is always "GeoCoordinates" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "GeoCoordinates";

    /// <summary> Gets or sets the latitude coordinate of the event's location. </summary>
    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    /// <summary> Gets or sets the longitude coordinate of the event's location. </summary>
    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }
}