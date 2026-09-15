

using System.Globalization;
using System.Text;
using Microsoft.Extensions.Options;
using Scrappy.Extensions;

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Formats event selections for WhatsApp messages and templates.
/// </summary>
public sealed class WhatsAppEventMessageFormatter
{
    private readonly TimeZoneInfo _timeZone;

    public WhatsAppEventMessageFormatter(IOptions<WhatsAppOptions> options)
    {
        _timeZone = TimeZoneInfo.FindSystemTimeZoneById(options.Value.MessageTimeZone);
    }

    /// <summary>
    /// Formats the event list used by the weekly template body.
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