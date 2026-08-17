

using System.ComponentModel.DataAnnotations;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.DTOs.Requests;

/// <summary>
/// Represents a request DTO for creating or updating an event location, including properties such as name, locality, district, region, address, country, DICO code, latitude, and longitude.
/// 
/// Example:
/// {
///   "name": "Event Location Name",
///   "locality": "Faro",
///   "district": "Algarve",
///   "region": "PT15",
///   "country": "PT",
///   "dicoCode": "PT15",
///   "latitude": "37.0194",
///   "longitude": "-7.9304"
/// }
/// </summary>
public class EventLocationRequestDto
{
    // Location properties
    /// <summary> Gets or sets the name of the event location. </summary>
    [Required]
    public string Name { get; set; } = string.Empty;



    // Address Properties
    /// <summary> Gets or sets the locality of the event location. </summary>
    [Required]
    public LocalityName? Locality { get; set; }

    /// <summary> Gets or sets the district of the event location. </summary>
    [Required]
    public DistrictName? District { get; set; }

    /// <summary> Gets or sets the NUTS2 region of the event location. </summary>
    [Required]
    public Nuts2Region? Region { get; set; }
    
    /// <summary> Gets or sets the country of the event location, which is always "PT" for this DTO. </summary>
    public string Country { get; set; } = "PT";

    /// <summary> Gets or sets the DICO code of the event location. </summary>
    public string? DicoCode { get; set; }



    // Geo Properties
    /// <summary> Gets or sets the latitude of the event location. </summary>
    public string? Latitude { get; set; }

    /// <summary> Gets or sets the longitude of the event location. </summary>
    public string? Longitude { get; set; }
}
