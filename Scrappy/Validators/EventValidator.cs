

using Scrappy.DTOs.Requests;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Services;

namespace Scrappy.Validators;

public static class Validator
{
    public static bool IsDistrictValid(DistrictName? district) =>
        district.HasValue && Enum.IsDefined(district.Value);

    public static bool IsTypeValid(EventType? type) =>
        type.HasValue && Enum.IsDefined(type.Value);

    public static bool IsLocalityValid(LocalityName? locality) =>
        locality.HasValue && Enum.IsDefined(locality.Value);

    public static bool IsRegionValid(Nuts2Region? region) =>
        region.HasValue && Enum.IsDefined(region.Value);

    public static bool IsTitleValid(string? title) =>
        !string.IsNullOrWhiteSpace(title) && title.Trim().Length <= 250 && title.Trim().Length >= 3;

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
        IsLocalityValid(location.Locality) &&
        IsDistrictValid(location.District) &&
        IsRegionValid(location.Region);

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
        if (!IsTitleValid(candidate.Title) || !IsLocationValid(candidate.Location))
            return false;

        var eventsResult = await eventService.GetAllEvents();
        if (!eventsResult.IsSuccess || eventsResult.Value is null)
            return false;

        var cleanTitle = candidate.Title.Trim();

        return eventsResult.Value.Any(existing =>
            existing.District == candidate.Location!.District!.Value &&
            existing.Event.StartDate == candidate.StartDate &&
            existing.Event.Title.Trim().Equals(
                cleanTitle,
                StringComparison.OrdinalIgnoreCase));
    }
}
