

namespace Scrappy.Models.Configuration;


/// <summary>
/// Configuration for municipality-specific external resources.
/// </summary>
public sealed class MunicipalityCatalogOptions
{
    /// <summary>Configuration section name.</summary>
    public const string SectionName = "MunicipalityCatalog";

    /// <summary>Municipalities indexed by their canonical slug.</summary>
    public Dictionary<string, MunicipalityCatalogEntry> Entries
    { get; init; } =
        new(StringComparer.OrdinalIgnoreCase);
}

/// <summary>
/// External resources associated with one municipality.
/// </summary>
public sealed class MunicipalityCatalogEntry
{
    /// <summary>Relative public path of the municipality logo.</summary>
    public string LogoPath { get; init; } = string.Empty;

    /// <summary> Absolute HTTPS URL of the municipality's official events agenda. </summary>
    public string WebsiteUrl { get; init; } = string.Empty;
}