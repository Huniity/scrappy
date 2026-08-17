

using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Models.Entities;

public class LocationModel
{
    public string Name { get; set; } = string.Empty;
    public LocalityName Locality { get; set; }
    public DistrictName District { get; set; }
    public Nuts2Region Region { get; set; }
    public string Country { get; set; } = "PT";
    public string? DicoCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
