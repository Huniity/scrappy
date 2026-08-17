

using Scrappy.DTOs.Common;

namespace Scrappy.DTOs.Responses;

/// <summary>
/// Represents a response DTO for event location information, including properties such as name, locality, district, region, country, DICO code, latitude, and longitude.
/// 
/// Example:
/// {
///   "name": "Sample Event Location",
///   "locality": "Faro",
///   "district": "Algarve",
///   "region": "PT15",
///   "country": "PT",
///   "dicoCode": "PT15",
///   "latitude": 37.0194,
///   "longitude": -7.9304
/// }
/// </summary>
public class EventLocationResponseDto
{
    /// <summary> Gets or sets the name of the event location. </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the locality of the event location. </summary>
    public string Locality { get; set; } = string.Empty;

    /// <summary> Gets or sets the district of the event location. </summary>
    public string District { get; set; } = string.Empty;

    /// <summary> Gets or sets the NUTS2 region of the event location. </summary>
    public CodeNameDto Region { get; set; } = new(string.Empty, string.Empty);

    /// <summary> Gets or sets the country of the event location, which is always "PT" for this DTO. </summary>
    public string Country { get; set; } = "PT";

    /// <summary> Gets or sets the DICO code of the event location. </summary>
    public string? DicoCode { get; set; }

    /// <summary> Gets or sets the latitude of the event location. </summary>
    public double? Latitude { get; set; }

    /// <summary> Gets or sets the longitude of the event location. </summary>
    public double? Longitude { get; set; }
}
