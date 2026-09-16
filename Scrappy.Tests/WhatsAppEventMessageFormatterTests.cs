using Microsoft.Extensions.Options;
using Scrappy.Integrations.WhatsApp;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Tests;

public class WhatsAppEventMessageFormatterTests
{
    [Fact]
    public void FormatTemplateEventsSummary_RemovesUnsupportedWhitespace()
    {
        var formatter = new WhatsAppEventMessageFormatter(
            Options.Create(new WhatsAppOptions
            {
                MessageTimeZone = "Europe/Lisbon"
            }));

        var selection = new WhatsAppEventSelection(
            LocalityName.Faro,
            "faro",
            new DateTime(2026, 9, 15, 12, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 9, 20, 22, 59, 59, DateTimeKind.Utc),
            2,
            [
                new WhatsAppEventItem(
                    "Primeiro\nevento",
                    new DateTime(2026, 9, 18, 20, 0, 0, DateTimeKind.Utc),
                    "Praça     Central"),
                new WhatsAppEventItem(
                    "Segundo\tevento",
                    new DateTime(2026, 9, 19, 17, 0, 0, DateTimeKind.Utc),
                    "Teatro Municipal")
            ]);

        var result = Assert.Single(
            formatter.FormatTemplateEventSummaryParts(selection));

        Assert.DoesNotContain('\n', result);
        Assert.DoesNotContain('\r', result);
        Assert.DoesNotContain('\t', result);
        Assert.DoesNotContain("     ", result);
        Assert.Contains(" • 📌 ", result);
    }

    [Fact]
    public void FormatTemplateEventSummaryParts_SplitsCompleteEvents()
    {
        var formatter = new WhatsAppEventMessageFormatter(
            Options.Create(new WhatsAppOptions
            {
                MessageTimeZone = "Europe/Lisbon",
                MaxTemplateSummaryCharacters = 160,
                MaxTemplateMessagesPerReport = 3
            }));

        var selection = new WhatsAppEventSelection(
            LocalityName.Alcobaça,
            "alcobaca",
            new DateTime(2026, 9, 15, 12, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 9, 20, 22, 59, 59, DateTimeKind.Utc),
            2,
            [
                new WhatsAppEventItem(
                    "Primeiro evento com um título suficientemente comprido",
                    new DateTime(2026, 9, 18, 20, 0, 0, DateTimeKind.Utc),
                    "Praça Central de Alcobaça"),
                new WhatsAppEventItem(
                    "Segundo evento que não deverá caber por inteiro",
                    new DateTime(2026, 9, 19, 17, 0, 0, DateTimeKind.Utc),
                    "Teatro Municipal")
            ]);

        var result =
            formatter.FormatTemplateEventSummaryParts(selection);

        Assert.Equal(2, result.Count);
        Assert.All(result, part => Assert.True(part.Length <= 160));
        Assert.StartsWith("Parte 1/2 · ", result[0]);
        Assert.StartsWith("Parte 2/2 · ", result[1]);
        Assert.Contains("Primeiro evento", result[0]);
        Assert.DoesNotContain("Segundo evento", result[0]);
        Assert.Contains("Segundo evento", result[1]);
    }

    [Fact]
    public void FormatTemplateEventSummaryParts_StopsAtConfiguredMessageLimit()
    {
        var formatter = new WhatsAppEventMessageFormatter(
            Options.Create(new WhatsAppOptions
            {
                MessageTimeZone = "Europe/Lisbon",
                MaxTemplateSummaryCharacters = 120,
                MaxTemplateMessagesPerReport = 2
            }));

        var events = Enumerable.Range(1, 4)
            .Select(index => new WhatsAppEventItem(
                $"Evento número {index} com título extenso",
                new DateTime(2026, 9, 18, 20, 0, 0, DateTimeKind.Utc),
                "Praça Central de Alcobaça"))
            .ToArray();

        var selection = new WhatsAppEventSelection(
            LocalityName.Alcobaça,
            "alcobaca",
            new DateTime(2026, 9, 15, 12, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 9, 20, 22, 59, 59, DateTimeKind.Utc),
            events.Length,
            events);

        var result =
            formatter.FormatTemplateEventSummaryParts(selection);

        Assert.Equal(2, result.Count);
        Assert.All(result, part => Assert.True(part.Length <= 120));
        Assert.StartsWith("Parte 1/2 · ", result[0]);
        Assert.StartsWith("Parte 2/2 · ", result[1]);
        Assert.EndsWith("…", result[1]);
    }
}
