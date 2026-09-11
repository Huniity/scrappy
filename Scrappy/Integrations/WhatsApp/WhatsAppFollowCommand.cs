

using Scrappy.Models.Entities.Enums;

namespace Scrappy.Integrations.WhatsApp;

public sealed record FollowLocalityCommand(
    string LocalitySlug,
    LocalityName Locality);

public sealed class WhatsAppCommandResolver
{
    private static readonly IReadOnlyDictionary<string, LocalityName>LocalitiesBySlug = BuildLocalitiesBySlug();

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