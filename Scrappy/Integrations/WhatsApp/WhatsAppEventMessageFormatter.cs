

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
    private readonly int _maxFreeFormMessageCharacters;

    /// <summary>
    /// Initializes a new instance of the <see cref="WhatsAppEventMessageFormatter"/> class.
    /// </summary>
    public WhatsAppEventMessageFormatter(IOptions<WhatsAppOptions> options)
    {
        _timeZone = TimeZoneInfo.FindSystemTimeZoneById(options.Value.MessageTimeZone);

        _maxFreeFormMessageCharacters =
            options.Value.MaxFreeFormMessageCharacters;

        if (_maxFreeFormMessageCharacters is < 100 or > 4096)
        {
            throw new InvalidOperationException(
                "WhatsApp MaxFreeFormMessageCharacters must be " +
                "between 100 and 4096.");
        }
    }

    /// <summary>
    /// Formats the event list used by normal text reports.
    /// </summary>
    public string FormatEventsSummary(
        WhatsAppEventSelection selection)
    {
        ArgumentNullException.ThrowIfNull(selection);

        if (!selection.HasEvents)
        {
            return string.Empty;
        }

        return string.Join(
            "\n\n",

            selection.Events.Select(FormatEventDetailBlock));
    }

    /// <summary>
    /// Formats one event as a three-line free-form text block.
    /// </summary>
    private string FormatEventDetailBlock(
        WhatsAppEventItem eventItem)
    {
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

        var title = NormalizeInlineText(
            eventItem.Title,
            "Evento sem título");

        var place = NormalizeInlineText(
            eventItem.Place,
            "Local não indicado");

        return
            $"📌 {title}\n" +
            $"📅 {formattedDate}\n" +
            $"📍 {place}";
    }

    /// <summary>
    /// Formats event details as free-form WhatsApp message parts.
    /// </summary>
    public IReadOnlyList<string>
    FormatEventDetailParts(
        WhatsAppEventSelection selection)
    {
        ArgumentNullException.ThrowIfNull(selection);

        if (!selection.HasEvents)
        {
            return [];
        }

        var eventBlocks = selection.Events
            .Select(FormatEventDetailBlock)
            .ToArray();

        return PackEventBlocks(
            eventBlocks,
            _maxFreeFormMessageCharacters,
            "\n\n");
    }

    /// <summary>
    /// Normalizes inline text by trimming whitespace and replacing
    /// multiple spaces with a single space. If the value is null or empty,
    /// returns the provided fallback string.
    /// </summary>
    private static string NormalizeInlineText(
        string? value,
        string fallback)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return fallback;
        }

        return Regex.Replace(value, @"\s+", " ").Trim();
    }



    /// <summary>
    /// Packs event blocks into parts that do not exceed the specified content limit.
    /// </summary>
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



    /// <summary>
    /// Truncates the value at a word boundary if it exceeds the maximum length.
    /// </summary>
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
