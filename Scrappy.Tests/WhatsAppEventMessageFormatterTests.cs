using Microsoft.Extensions.Options;
using Scrappy.Integrations.WhatsApp;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Tests;

public class WhatsAppEventMessageFormatterTests
{
    [Fact]
    public void FormatEventDetailParts_NormalizesUnsupportedWhitespace()
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
            1,
            [
                new WhatsAppEventItem(
                    "Primeiro\nevento",
                    new DateTime(2026, 9, 18, 20, 0, 0, DateTimeKind.Utc),
                    "Praça     Central")
            ]);

        var result = Assert.Single(
            formatter.FormatEventDetailParts(selection));

        Assert.DoesNotContain('\r', result);
        Assert.DoesNotContain('\t', result);
        Assert.DoesNotContain("     ", result);
        Assert.Contains("Primeiro evento", result);
        Assert.Contains("Praça Central", result);
    }

    [Fact]
    public void FormatEventDetailParts_SplitsCompleteEvents()
    {
        var formatter = new WhatsAppEventMessageFormatter(
            Options.Create(new WhatsAppOptions
            {
                MessageTimeZone = "Europe/Lisbon",
                MaxFreeFormMessageCharacters = 160
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
            formatter.FormatEventDetailParts(selection);

        Assert.Equal(2, result.Count);
        Assert.All(result, part => Assert.True(part.Length <= 160));
        Assert.StartsWith("📌 Primeiro evento", result[0]);
        Assert.Contains("Primeiro evento", result[0]);
        Assert.DoesNotContain("Segundo evento", result[0]);
        Assert.Contains("Segundo evento", result[1]);
    }

    [Fact]
    public void FormatEventDetailParts_TruncatesOversizedEvents()
    {
        var formatter = new WhatsAppEventMessageFormatter(
            Options.Create(new WhatsAppOptions
            {
                MessageTimeZone = "Europe/Lisbon",
                MaxFreeFormMessageCharacters = 120
            }));

        var selection = new WhatsAppEventSelection(
            LocalityName.Alcobaça,
            "alcobaca",
            new DateTime(2026, 9, 15, 12, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 9, 20, 22, 59, 59, DateTimeKind.Utc),
            1,
            [
                new WhatsAppEventItem(
                    "Evento com um título muito extenso que excede o limite da mensagem",
                    new DateTime(2026, 9, 18, 20, 0, 0, DateTimeKind.Utc),
                    "Praça Central de Alcobaça com uma descrição de local igualmente extensa")
            ]);

        var result =
            formatter.FormatEventDetailParts(selection);

        Assert.Single(result);
        Assert.All(result, part => Assert.True(part.Length <= 120));
        Assert.EndsWith("…", result[0]);
    }
}
