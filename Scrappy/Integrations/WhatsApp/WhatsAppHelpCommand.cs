

namespace Scrappy.Integrations.WhatsApp;


public sealed class WhatsAppHelpCommand
{
    public bool TryResolveHelp(string? text)
    {
        var command = text?.Trim();

        return
            string.Equals(
                command,
                "Help",
                StringComparison.OrdinalIgnoreCase) ||
            string.Equals(
                command,
                "Ajuda",
                StringComparison.OrdinalIgnoreCase);
    }
}
