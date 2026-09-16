

using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using Scrappy.Extensions;

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Formats event selections for WhatsApp messages and templates.
/// </summary>
public sealed class WhatsAppEventMessageFormatter
{
    private readonly TimeZoneInfo _timeZone;
    private readonly int _maxTemplateSummaryCharacters;
    private readonly int _maxTemplateMessagesPerReport;

    public WhatsAppEventMessageFormatter(IOptions<WhatsAppOptions> options)
    {
        _timeZone = TimeZoneInfo.FindSystemTimeZoneById(options.Value.MessageTimeZone);

        _maxTemplateSummaryCharacters =
            options.Value.MaxTemplateSummaryCharacters;

        if (_maxTemplateSummaryCharacters is < 100 or > 800)
        {
            throw new InvalidOperationException(
                "WhatsApp MaxTemplateSummaryCharacters must be " +
                "between 100 and 800.");
        }

        _maxTemplateMessagesPerReport =
            options.Value.MaxTemplateMessagesPerReport;

        if (_maxTemplateMessagesPerReport is < 1 or > 10)
        {
            throw new InvalidOperationException(
                "WhatsApp MaxTemplateMessagesPerReport must be " +
                "between 1 and 10.");
        }
    }

    /// <summary>
    /// Formats the event list used by normal text reports.
    /// </summary>
    public string FormatEventsSummary(WhatsAppEventSelection selection)
    {
        ArgumentNullException.ThrowIfNull(selection);

        if (!selection.HasEvents)
        {
            return string.Empty;
        }

        var summary = new StringBuilder();

        for (var index = 0; index < selection.Events.Count; index++)
        {
            var eventItem = selection.Events[index];

            var startDateUtc = DateTime.SpecifyKind(
                eventItem.StartDate,
                DateTimeKind.Utc);

            var localStartDate =
                TimeZoneInfo.ConvertTimeFromUtc(
                    startDateUtc,
                    _timeZone);

            var formattedDate = localStartDate.ToString(
                "dd 'de' MMMM, HH:mm",
                CultureInfo.GetCultureInfo("pt-PT"));

            var title = string.IsNullOrWhiteSpace(
                eventItem.Title)
                    ? "Evento sem título"
                    : eventItem.Title.Trim();

            summary.AppendLine($"📌 {title}");
            summary.AppendLine($"📅 {formattedDate}");
            summary.AppendLine($"📍 {eventItem.Place}");

            if (index < selection.Events.Count - 1)
            {
                summary.AppendLine();
            }
        }

        return summary.ToString().TrimEnd();
    }

    /// <summary>
    /// Formats the event list as template-safe text parameters.
    /// </summary>
    public IReadOnlyList<string> FormatTemplateEventSummaryParts(
        WhatsAppEventSelection selection)
    {
        ArgumentNullException.ThrowIfNull(selection);

        if (!selection.HasEvents)
        {
            return [];
        }

        var eventBlocks = selection.Events
            .Select(FormatTemplateEventBlock)
            .ToArray();

        // const string separator = " • ";
        const string separator = "\n";
        var completeSummary = string.Join(separator, eventBlocks);

        if (completeSummary.Length <= _maxTemplateSummaryCharacters)
        {
            return [completeSummary];
        }

        var prefixReserve =
            ($"Parte {_maxTemplateMessagesPerReport}/" +
             $"{_maxTemplateMessagesPerReport} · ").Length;

        var contentLimit =
            _maxTemplateSummaryCharacters - prefixReserve;

        var allParts = PackEventBlocks(
            eventBlocks,
            contentLimit,
            separator);

        var partCount = Math.Min(
            allParts.Count,
            _maxTemplateMessagesPerReport);

        var parts = allParts
            .Take(partCount)
            .ToList();

        if (allParts.Count > partCount)
        {
            parts[^1] = AddOmittedEventsMarker(
                parts[^1],
                contentLimit);
        }

        return parts
            .Select((part, index) =>
                $"Parte {index + 1}/{partCount} · {part}")
            .ToArray();
    }

    private string FormatTemplateEventBlock(
        WhatsAppEventItem eventItem)
    {
        var startDateUtc = DateTime.SpecifyKind(
            eventItem.StartDate,
            DateTimeKind.Utc);

        var localStartDate = TimeZoneInfo.ConvertTimeFromUtc(
            startDateUtc,
            _timeZone);

        var formattedDate = localStartDate.ToString(
            "dd 'de' MMMM, HH:mm",
            CultureInfo.GetCultureInfo("pt-PT"));

        var title = string.IsNullOrWhiteSpace(eventItem.Title)
            ? "Evento sem título"
            : eventItem.Title.Trim();

        return NormalizeTemplateText(
            $"📌 {title} · 📅 {formattedDate} · 📍 {eventItem.Place}");
    }

    private static IReadOnlyList<string> PackEventBlocks(
        IReadOnlyList<string> eventBlocks,
        int contentLimit,
        string separator)
    {
        var parts = new List<string>();
        var currentPart = new StringBuilder();

        foreach (var originalBlock in eventBlocks)
        {
            var eventBlock = originalBlock.Length <= contentLimit
                ? originalBlock
                : TruncateAtWordBoundary(originalBlock, contentLimit);

            var requiredLength = currentPart.Length == 0
                ? eventBlock.Length
                : separator.Length + eventBlock.Length;

            if (currentPart.Length > 0 &&
                currentPart.Length + requiredLength > contentLimit)
            {
                parts.Add(currentPart.ToString());
                currentPart.Clear();
            }

            if (currentPart.Length > 0)
            {
                currentPart.Append(separator);
            }

            currentPart.Append(eventBlock);
        }

        if (currentPart.Length > 0)
        {
            parts.Add(currentPart.ToString());
        }

        return parts;
    }

    private static string AddOmittedEventsMarker(
        string value,
        int maximumLength)
    {
        const string separator = " • ";
        const string marker = " • …";

        if (value.Length + marker.Length <= maximumLength)
        {
            return value + marker;
        }

        var eventBlocks = value.Split(
            separator,
            StringSplitOptions.RemoveEmptyEntries);

        for (var count = eventBlocks.Length - 1; count > 0; count--)
        {
            var completeEvents = string.Join(
                separator,
                eventBlocks.Take(count));

            if (completeEvents.Length + marker.Length <= maximumLength)
            {
                return completeEvents + marker;
            }
        }

        return TruncateAtWordBoundary(
            value,
            maximumLength - marker.Length) + marker;
    }

    private static string NormalizeTemplateText(string value)
    {
        return Regex.Replace(value, @"\s+", " ").Trim();
    }

    private static string TruncateAtWordBoundary(
        string value,
        int maximumLength)
    {
        var contentLength = maximumLength - 1;
        var lastSpace = value.LastIndexOf(
            ' ',
            contentLength - 1,
            contentLength);

        if (lastSpace < contentLength / 2)
        {
            lastSpace = contentLength;
        }

        return value[..lastSpace].TrimEnd() + "…";
    }

    /// <summary>
    /// Formats the complete immediate subscription report.
    /// </summary>
    public string FormatImmediateReport(
        WhatsAppEventSelection selection)
    {
        ArgumentNullException.ThrowIfNull(selection);

        var localityName =
            selection.Locality.GetDisplayName();

        if (!selection.HasEvents)
        {
            return
                $"Não existem eventos publicados em " + $"{localityName} até ao próximo domingo.\n" + "Receberás o próximo relatório semanal.";
        }

        var eventLabel = selection.TotalEventCount == 1
            ? "evento"
            : "eventos";

        var eventsSummary =
            FormatEventsSummary(selection);

        return $"📅 Encontrámos {selection.TotalEventCount} " + $"{eventLabel} em {localityName}:\n\n" + eventsSummary;
    }
}
