using Scrappy.DTOs.Requests;
using Scrappy.Models.Entities;
using Scrappy.Services;

namespace Scrappy.Validators;

public static class Validator
{
    public static bool IsDistrictValid(DistrictName district) =>
        Enum.IsDefined(district);

    public static bool IsTypeValid(EventType type) =>
        Enum.IsDefined(type);

    public static bool IsTitleValid(string? title) =>
        !string.IsNullOrWhiteSpace(title) && title.Trim().Length <= 250;

    public static async Task<bool> IsTitleValidAndAvailable(
        string? title,
        EventService eventService,
        string? excludedEventId = null)
    {
        if (!IsTitleValid(title))
            return false;

        var eventsResult = await eventService.GetAllEvents();
        if (!eventsResult.IsSuccess || eventsResult.Value is null)
            return true;

        var cleanTitle = title!.Trim();

        return !eventsResult.Value.Any(existing =>
            existing.Id != excludedEventId &&
            existing.Event.Title.Trim().Equals(
                cleanTitle,
                StringComparison.OrdinalIgnoreCase));
    }

    public static bool IsDescriptionValid(string? description) =>
        !string.IsNullOrWhiteSpace(description) &&
        description.Trim().Length is >= 10 and <= 2000;

    public static bool AreDatesValid(DateTime startDate, DateTime? endDate) =>
        startDate != default && (!endDate.HasValue || endDate.Value >= startDate);

    public static bool IsLocationValid(EventLocationRequestDto? location) =>
        location is not null &&
        !string.IsNullOrWhiteSpace(location.Name) &&
        location.Name.Trim().Length <= 250 &&
        IsDistrictValid(location.District);

    public static bool IsSourceUrlValid(string? sourceUrl)
    {
        if (string.IsNullOrWhiteSpace(sourceUrl))
            return false;

        return Uri.TryCreate(sourceUrl.Trim(), UriKind.Absolute, out var uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) &&
               uri.Host.Contains('.');
    }

    public static async Task<bool> IsDuplicateOnCreate(
        CreateEventDto candidate,
        EventService eventService)
    {
        if (!IsTitleValid(candidate.Title) || candidate.Location is null)
            return false;

        var eventsResult = await eventService.GetAllEvents();
        if (!eventsResult.IsSuccess || eventsResult.Value is null)
            return false;

        var cleanTitle = candidate.Title.Trim();

        return eventsResult.Value.Any(existing =>
            existing.District == candidate.Location.District &&
            existing.Event.StartDate == candidate.StartDate &&
            existing.Event.Title.Trim().Equals(
                cleanTitle,
                StringComparison.OrdinalIgnoreCase));
    }
}
