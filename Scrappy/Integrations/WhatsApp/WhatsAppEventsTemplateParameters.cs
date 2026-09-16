

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Values required by the approved events template.
/// </summary>
public sealed record WhatsAppEventsTemplateParameters(
    string LocalityName,
    long EventCount,
    string EventsSummary,
    string LogoPath);
