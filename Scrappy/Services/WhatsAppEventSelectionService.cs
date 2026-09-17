

using Microsoft.Extensions.Options;
using Scrappy.DTOs.Requests;
using Scrappy.Integrations.WhatsApp;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;


namespace Scrappy.Services;


/// <summary>
/// Selects published events for a locality and report window.
/// </summary>
public sealed class WhatsAppEventSelectionService(
    EventQueryService eventQueryService,
    IOptions<WhatsAppOptions> options)
{
    private readonly WhatsAppOptions _options = options.Value;

    public async Task<WhatsAppEventSelection>
    SelectAsync(
        LocalityName locality,
        DateTime windowStartUtc,
        DateTime windowEndUtc,
        CancellationToken cancellationToken = default)
    {
        if (windowStartUtc.Kind != DateTimeKind.Utc)
        {
            throw new ArgumentException("Window start must be in UTC.", nameof(windowStartUtc));
        }

        if (windowEndUtc.Kind != DateTimeKind.Utc)
        {
            throw new ArgumentException("Window end must be in UTC.", nameof(windowEndUtc));
        }

        if (windowStartUtc > windowEndUtc)
        {
            throw new ArgumentException("Window start cannot be later than window end.");
        }

        if (_options.MaxEventsPerMessage is < 1 or > 100)
        {
            throw new InvalidOperationException("WhatsApp MaxEventsPerMessage must be between 1 and 100.");
        }

        var queryResult = await
        eventQueryService.QueryAsync(
            new EventQueryParameters
            {
                Page = 1,
                PageSize = _options.MaxEventsPerMessage,
                Locality = locality,
                StartDate = windowStartUtc,
                EndDate = windowEndUtc,
                SortBy = "date_asc",
                IsPublished = false
            },
            cancellationToken);

        if (!queryResult.IsSuccess || queryResult.Value
        is null)
        {
            throw new InvalidOperationException($"Could not select WhatsApp events: {queryResult.Error}");
        }

        var events = queryResult.Value.Items
            .Select(districtEvent => new WhatsAppEventItem(
                districtEvent.Event.Title,
                districtEvent.Event.StartDate,
                BuildPlace(districtEvent)))
            .ToList();

        return new WhatsAppEventSelection(
            locality,
            LocalitySlug.From(locality),
            windowStartUtc,
            windowEndUtc,
            queryResult.Value.TotalCount,
            events);
    }

    private static string BuildPlace(DistrictEvent districtEvent)
    {
        var location = districtEvent.Event.Location;

        if (location is null)
        {
            return "Local a confirmar";
        }

        var parts = new[]
        {
            location.Name,
            location.StreetAddress,
            location.PostalCode
        }
        .Where(part => !string.IsNullOrWhiteSpace(part))
        .Distinct(StringComparer.OrdinalIgnoreCase);

        var place = string.Join(", ", parts);

        return string.IsNullOrWhiteSpace(place)
            ? "Local a confirmar"
            : place;
    }
}
