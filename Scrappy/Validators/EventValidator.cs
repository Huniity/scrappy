

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

    public static bool IsCountryValid(string? country) =>
        string.Equals(country?.Trim(), "PT", StringComparison.OrdinalIgnoreCase);

    public static bool IsDicoCodeValid(string? dicoCode) =>
        !string.IsNullOrWhiteSpace(dicoCode) &&
        dicoCode.Trim().Length == 4 &&
        dicoCode.Trim().All(char.IsDigit);

    public static bool IsLatitudeValid(string? latitude) =>
        !string.IsNullOrWhiteSpace(latitude) &&
        double.TryParse(latitude.Trim(), out var lat) &&
        lat is >= -90 and <= 90;

    public static bool IsLongitudeValid(string? longitude) =>
        !string.IsNullOrWhiteSpace(longitude) &&
        double.TryParse(longitude.Trim(), out var lon) &&
        lon is >= -180 and <= 180;

    public static bool IsTitleValid(string? title) =>
        !string.IsNullOrWhiteSpace(title) && title.Trim().Length <= 250 && title.Trim().Length >= 3;

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
        IsRegionValid(location.Region) &&
        IsCountryValid(location.Country) &&
        IsDicoCodeValid(location.DicoCode) &&
        IsLatitudeValid(location.Latitude) &&
        IsLongitudeValid(location.Longitude);

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

        return HasDuplicate(
            eventsResult.Value,
            null,
            candidate.Title,
            candidate.Location!.District!.Value,
            candidate.StartDate);
    }

    public static async Task<bool> IsDuplicateOnUpdate(
        string eventId,
        string? title,
        DistrictName district,
        DateTime startDate,
        EventService eventService)
    {
        if (!IsTitleValid(title) || !IsDistrictValid(district) || startDate == default)
            return false;

        var eventsResult = await eventService.GetAllEvents();
        if (!eventsResult.IsSuccess || eventsResult.Value is null)
            return false;

        return HasDuplicate(eventsResult.Value, eventId, title, district, startDate);
    }

    public static bool HasDuplicate(
        IEnumerable<DistrictEvent> events,
        string? excludedEventId,
        string? title,
        DistrictName district,
        DateTime startDate)
    {
        if (!IsTitleValid(title) || !IsDistrictValid(district) || startDate == default)
            return false;

        var cleanTitle = title!.Trim();

        return events.Any(existing =>
            existing.Id != excludedEventId &&
            existing.District == district &&
            existing.Event.StartDate == startDate &&
            existing.Event.Title.Trim().Equals(
                cleanTitle,
                StringComparison.OrdinalIgnoreCase));
    }
}
