


using Scrappy.Models;
using Scrappy.Models.Entities;
using System.Text.Json.Serialization;


namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents the place information for an event in the Schema.org format. This class is used to define the location of an event, including its name, address, and geographical coordinates.
/// 
/// Example:
/// {
///  "@type": "Place",
///  "name": "Event Venue",
///  "address": {
///    "@type": "PostalAddress",
///    "addressLocality": "Loulé",
///    "addressRegion": "Algarve",
///    "addressCountry": "PT"
///    "identifier": "PT15",
///  },
///  "geo": {
///    "@type": "GeoCoordinates",
///    "latitude": 40.7128,
///    "longitude": -74.0060
///  }
/// }
/// </summary>
public class SchemaOrgPlaceDto
{
    /// <summary> Gets or sets the type of the place, which is always "Place" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "Place";

    /// <summary> Gets or sets the name of the place. </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the address of the place, represented as a SchemaOrgAddressDto object. </summary>
    [JsonPropertyName("address")]
    public SchemaOrgAddressDto? Address { get; set; }

    /// <summary> Gets or sets the geographical coordinates of the place, represented as a SchemaOrgGeoDto object. </summary>
    [JsonPropertyName("geo")]
    public SchemaOrgGeoDto? Geo { get; set; }
}