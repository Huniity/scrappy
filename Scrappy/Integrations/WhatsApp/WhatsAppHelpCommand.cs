

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

    public string GetHelpMessage()
    {
        return "ℹ️ Comandos disponíveis:\n\n" +
               "• Obter eventos de <localidade> - Para seguir os eventos de uma localidade específica.\n" +
               "• Stop <localidade> - Para deixar de seguir os eventos de uma localidade específica.";
    }
}