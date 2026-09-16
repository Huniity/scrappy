

using Scrappy.Models.Entities.Enums;
using System.Globalization;

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Represents a command to follow a specific locality, containing the locality's slug and its corresponding <see cref="LocalityName"/>.
/// </summary>
public sealed record FollowLocalityCommand(
    string LocalitySlug,
    LocalityName Locality);


/// <summary>
/// Represents a command to stop following a specific locality, containing the locality's slug and its corresponding <see cref="LocalityName"/>.
/// </summary>
public sealed record StopLocalityCommand(
    string LocalitySlug,
    LocalityName Locality);

/// <summary>
/// Represents a request to receive the event report for a locality
/// within a specific date window.
/// </summary>
public sealed record WhatsAppEventReportRequest(
    string LocalitySlug,
    LocalityName Locality,
    DateOnly WindowStartDate,
    DateOnly WindowEndDate);

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

        if (parts.Length < 2 ||
            !string.Equals(
                parts[0],
                "Subscrever",
                StringComparison.OrdinalIgnoreCase)
        {
            return false;
        }

        var localityText = string.Join(" ", parts.Skip(1));

        if (!TryResolveLocality(localityText, out var locality))
        {
            return false;
        }

        command = new FollowLocalityCommand(
            LocalitySlug.From(locality),
            locality);

        return true;
    }



    /// <summary>
    /// Attempts to resolve the given text message into a <see cref="StopLocalityCommand"/> if it matches the expected format for stopping events for a locality.
    /// </summary>
    /// <param name="text">The incoming text message to resolve.</param>
    /// <param name="command">The resolved <see cref="StopLocalityCommand"/> if the text matches the expected format; otherwise, null.</param>
    /// <returns>True if the text was successfully resolved into a command; otherwise, false.</returns>
    public bool TryResolveStop(
        string? text,
        out StopLocalityCommand? command)
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

        if (parts.Length < 2 ||
            !string.Equals(
                parts[0],
                "Stop",
                StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var localityText = string.Join(" ", parts.Skip(1));

        if (!TryResolveLocality(localityText, out var locality))
        {
            return false;
        }

        command = new StopLocalityCommand(
            LocalitySlug.From(locality),
            locality);

        return true;
    }


    /// <summary>
    /// Attempts to resolve a WhatsApp quick-reply payload into an event
    /// report request.
    /// </summary>
    public bool TryResolveEventReport(
        string? payload,
        out WhatsAppEventReportRequest? request)
    {
        request = null;

        if (string.IsNullOrWhiteSpace(payload))
        {
            return false;
        }

        var parts = payload.Split(
            ':',
            StringSplitOptions.TrimEntries);

        if (parts.Length != 4 ||
            !string.Equals(
                parts[0],
                "event_report",
                StringComparison.Ordinal) ||
            !LocalitiesBySlug.TryGetValue(
                parts[1],
                out var locality) ||
            !DateOnly.TryParseExact(
                parts[2],
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var windowStartDate) ||
            !DateOnly.TryParseExact(
                parts[3],
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var windowEndDate))
        {
            return false;
        }

        var windowLength =
            windowEndDate.DayNumber -
            windowStartDate.DayNumber;

        if (windowLength is < 0 or > 6 ||
            windowEndDate.DayOfWeek != DayOfWeek.Sunday)
        {
            return false;
        }

        request = new WhatsAppEventReportRequest(
            LocalitySlug.From(locality),
            locality,
            windowStartDate,
            windowEndDate);

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

    /// <summary>
    /// Resolves user input by applying the same canonical normalization used
    /// when the locality slug dictionary is built.
    /// </summary>
    private static bool TryResolveLocality(
        string localityText,
        out LocalityName locality)
    {
        var normalizedSlug = LocalitySlug.From(localityText);

        return LocalitiesBySlug.TryGetValue(
            normalizedSlug,
            out locality);
    }
}
