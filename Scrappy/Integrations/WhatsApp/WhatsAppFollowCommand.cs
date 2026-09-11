

using Scrappy.Models.Entities.Enums;


namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Represents a command to follow a specific locality, containing the locality's slug and its corresponding <see cref="LocalityName"/>.
/// </summary>
public sealed record FollowLocalityCommand(
    string LocalitySlug,
    LocalityName Locality);

/// <summary>
/// Resolves incoming WhatsApp text messages into structured commands, specifically for following localities.
/// </summary>
public sealed class WhatsAppCommandResolver
{
    /// <summary>
    /// A mapping of locality slugs to their corresponding <see cref="LocalityName"/> values, built from the <see cref="LocalityName"/> enum.
    /// </summary>
    private static readonly IReadOnlyDictionary<string, LocalityName>LocalitiesBySlug = BuildLocalitiesBySlug();

    /// <summary>
    /// Attempts to resolve the given text message into a <see cref="FollowLocalityCommand"/> if it matches the expected format for following a locality.
    /// </summary>
    /// <param name="text">The incoming text message to resolve.</param>
    /// <param name="command">The resolved <see cref="FollowLocalityCommand"/> if the text matches the expected format; otherwise, null.</param>
    /// <returns>True if the text was successfully resolved into a command; otherwise, false.</returns>
    public bool TryResolveFollow(
        string? text,
        out FollowLocalityCommand? command)
    {
        command = null;

        if (string.IsNullOrWhiteSpace(text))
        {
            return false;
        }

        var parts = text.Split(
            (char[]?)null,
            StringSplitOptions.RemoveEmptyEntries |
            StringSplitOptions.TrimEntries);

        if (parts.Length != 3 ||
            !string.Equals(parts[0], "SCRAPPY",
                StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(parts[1], "FOLLOW",
                StringComparison.OrdinalIgnoreCase) ||
            !LocalitiesBySlug.TryGetValue(parts[2], out var locality))
        {
            return false;
        }

        command = new FollowLocalityCommand(
            LocalitySlug.From(locality),
            locality);

        return true;
    }

    /// <summary>
    /// Builds a dictionary mapping locality slugs to their corresponding <see cref="LocalityName"/> values by iterating through the <see cref="LocalityName"/> enum and generating slugs for each value.
    /// </summary>
    /// <returns>A read-only dictionary mapping locality slugs to <see cref="LocalityName"/> values.</returns>
    private static IReadOnlyDictionary<string, LocalityName>
        BuildLocalitiesBySlug()
    {
        var result = new Dictionary<string, LocalityName>(
            StringComparer.OrdinalIgnoreCase);

        foreach (var locality in Enum.GetValues<LocalityName>())
        {
            var slug = LocalitySlug.From(locality);

            if (!result.TryAdd(slug, locality))
            {
                throw new InvalidOperationException(
                    $"Duplicate locality slug '{slug}'.");
            }
        }

        return result;
    }
}