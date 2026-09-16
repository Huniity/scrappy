

using Microsoft.Extensions.Options;
using Scrappy.Models.Configuration;

namespace Scrappy.Services;

/// <summary>
/// Municipality resources resolved from the canonical locality slug.
/// </summary>
public sealed record MunicipalityCatalogItem(
    string Slug,
    string LogoPath,
    string WebsiteUrl);

/// <summary>
/// Resolves configured municipality resources.
/// </summary>
public sealed class MunicipalityCatalog(
    IOptions<MunicipalityCatalogOptions> options)
{
    private readonly MunicipalityCatalogOptions _options = options.Value;

    /// <summary>
    /// Returns the configured resources for a municipality.
    /// </summary>
    /// <param name="localitySlug">The slug of the locality for which to retrieve resources.</param>
    /// <returns>The configured resources for the specified municipality.</returns>
    public MunicipalityCatalogItem GetRequired(string localitySlug)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(localitySlug);

        var normalizedSlug =
            localitySlug.Trim().ToLowerInvariant();

        if (!_options.Entries.TryGetValue(normalizedSlug, out var entry))
        {
            throw new KeyNotFoundException($"Municipality '{normalizedSlug}' is not configured.");
        }

        var logoPath = entry.LogoPath.Trim();

        if (!IsValidLogoPath(logoPath))
        {
            throw new InvalidOperationException($"Municipality '{normalizedSlug}' has an invalid logo path.");
        }

        var websiteUrl = entry.WebsiteUrl.Trim();

        if (!IsValidWebsiteUrl(websiteUrl))
        {
            throw new InvalidOperationException($"Municipality '{normalizedSlug}' has an invalid website URL.");
        }

        return new MunicipalityCatalogItem(normalizedSlug, logoPath, websiteUrl);
    }

    /// <summary>
    /// Validates the logo path for a municipality.
    /// </summary>
    /// <param name="logoPath">The logo path to validate.</param>
    /// <returns><c>true</c> if the logo path is valid; otherwise, <c>false</c>.</returns>
    private static bool IsValidLogoPath(string logoPath)
    {
        if (string.IsNullOrWhiteSpace(logoPath) ||
            !logoPath.StartsWith("/", StringComparison.Ordinal) ||
            logoPath.StartsWith("//", StringComparison.Ordinal) ||
            logoPath.Contains("..", StringComparison.Ordinal))
        {
            return false;
        }

        var extension = Path.GetExtension(logoPath);

        return extension.Equals(
                    ".png",
                    StringComparison.OrdinalIgnoreCase) ||
                extension.Equals(
                    ".jpg",
                    StringComparison.OrdinalIgnoreCase) ||
                extension.Equals(
                    ".jpeg",
                    StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Validates an official municipality website URL.
    /// </summary>
    private static bool IsValidWebsiteUrl(string websiteUrl)
    {
        return Uri.TryCreate(
                    websiteUrl,
                    UriKind.Absolute,
                    out var uri) &&
                uri.Scheme == Uri.UriSchemeHttps &&
                !string.IsNullOrWhiteSpace(uri.Host);
    }
}