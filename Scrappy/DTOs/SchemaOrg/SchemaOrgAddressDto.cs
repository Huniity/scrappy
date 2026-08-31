

using System.Text.Json.Serialization;
using Scrappy.Models;
using Scrappy.Models.Entities;

namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents a postal address in the Schema.org format.
/// 
/// Example:
/// {
///   "@type": "PostalAddress",
///   "addressLocality": "Faro",
///   "addressRegion": "Algarve",
///   "addressCountry": "PT",
///   "identifier": "PT15"
/// }
/// </summary>
public class SchemaOrgAddressDto
{
    /// <summary> Gets or sets the type of the address, which is always "PostalAddress" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "PostalAddress";

    /// <summary> Gets or sets the street address of the address. </summary>
    [JsonPropertyName("streetAddress")]
    public string? StreetAddress { get; set; }

    /// <summary> Gets or sets the postal code of the address. </summary>
    [JsonPropertyName("postalCode")]
    public string? PostalCode { get; set; }
    
    /// <summary> Gets or sets the locality (city or town) of the address. </summary>
    [JsonPropertyName("addressLocality")]
    public string Locality { get; set; } = string.Empty;

    /// <summary> Gets or sets the region (state or province) of the address. </summary>
    [JsonPropertyName("addressRegion")]
    public string Region { get; set; } = string.Empty;

    /// <summary> Gets or sets the country of the address, which is always "PT" for this DTO. </summary>
    [JsonPropertyName("addressCountry")]
    public string Country { get; set; } = "PT";

    /// <summary> Gets or sets the identifier (DICO code) of the address. </summary>
    [JsonPropertyName("identifier")]
    public string DicoCode { get; set; } = string.Empty;
}

