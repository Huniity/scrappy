

using Scrappy.Models.Entities.Enums;


namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Represents an event selected for a WhatsApp report.
/// </summary>
public sealed record WhatsAppEventItem(
    string Title,
    DateTime StartDate,
    string Place);


/// <summary>
/// Represents the events selected for one locality and date window.
/// </summary>
public sealed record WhatsAppEventSelection(
    LocalityName Locality,
    string LocalitySlug,
    DateTime WindowStartUtc,
    DateTime WindowEndUtc,
    long TotalEventCount,
    IReadOnlyList<WhatsAppEventItem> Events)
{
    /// <summary>
    /// Gets a value indicating whether there are any events in the selection.
    /// </summary>
    public bool HasEvents => TotalEventCount > 0;
}