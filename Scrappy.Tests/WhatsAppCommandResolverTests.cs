using Scrappy.Integrations.WhatsApp;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Tests;

public sealed class WhatsAppCommandResolverTests
{
    private readonly WhatsAppCommandResolver resolver = new();

    [Theory]
    [InlineData("Subscrever Alcobaça", "alcobaca", LocalityName.Alcobaça)]
    [InlineData("Subscrever alcobaca", "alcobaca", LocalityName.Alcobaça)]
    [InlineData("Subscrever Lourinhã", "lourinha", LocalityName.Lourinhã)]
    [InlineData("Subscrever lourinha", "lourinha", LocalityName.Lourinhã)]
    [InlineData(
        "  Subscrever   São João da Madeira  ",
        "sao-joao-da-madeira",
        LocalityName.SãoJoãoDaMadeira)]
    public void TryResolveFollow_NormalizesLocalityText(
        string text,
        string expectedSlug,
        LocalityName expectedLocality)
    {
        var resolved = resolver.TryResolveFollow(text, out var command);

        Assert.True(resolved);
        Assert.NotNull(command);
        Assert.Equal(expectedSlug, command.LocalitySlug);
        Assert.Equal(expectedLocality, command.Locality);
    }

    [Theory]
    [InlineData("Stop Alcobaça", "alcobaca", LocalityName.Alcobaça)]
    [InlineData("stop lourinha", "lourinha", LocalityName.Lourinhã)]
    [InlineData(
        "STOP Póvoa de Varzim",
        "povoa-de-varzim",
        LocalityName.PóvoaDeVarzim)]
    public void TryResolveStop_NormalizesLocalityText(
        string text,
        string expectedSlug,
        LocalityName expectedLocality)
    {
        var resolved = resolver.TryResolveStop(text, out var command);

        Assert.True(resolved);
        Assert.NotNull(command);
        Assert.Equal(expectedSlug, command.LocalitySlug);
        Assert.Equal(expectedLocality, command.Locality);
    }

    [Theory]
    [InlineData("Subscrever")]
    [InlineData("Stop")]
    [InlineData("Subscrever Localidade Inexistente")]
    [InlineData("Stop Localidade Inexistente")]
    public void Resolver_ReturnsFalseForInvalidLocalityCommands(string text)
    {
        var followResolved = resolver.TryResolveFollow(text, out _);
        var stopResolved = resolver.TryResolveStop(text, out _);

        Assert.False(followResolved || stopResolved);
    }
}
