

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Values required by the approved events template.
/// </summary>
public sealed record WhatsAppEventsTemplateParameters(
    string LocalityName,
    string LocalitySlug,
    long EventCount,
    DateOnly WindowStartDate,
    DateOnly WindowEndDate,
    string LogoPath);
