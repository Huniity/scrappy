

using Scrappy.DTOs.Requests;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Services;
using System.Globalization;

namespace Scrappy.Validators;

public static class Validator
{
    private const int MaxPerformers = 50;
    private const int MaxOffers = 50;
    private const int MaxKeywords = 50;
    private const int MaxKeywordLength = 100;
    private const int MaxSearchTermLength = 100;

    private static readonly HashSet<string> ValidSortOptions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "date_asc",
            "date_desc",
            "quality_asc",
            "quality_desc",
            "title_asc",
            "title_desc",
            "location_asc",
            "location_desc",
            "type_asc",
            "type_desc"
        };

    private static readonly HashSet<string> ValidOfferAvailabilities =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "BackOrder",
            "Discontinued",
            "InStock",
            "InStoreOnly",
            "LimitedAvailability",
            "MadeToOrder",
            "OnlineOnly",
            "OutOfStock",
            "PreOrder",
            "PreSale",
            "SoldOut"
        };

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
        double.TryParse(
            latitude.Trim(),
            NumberStyles.Float,
            CultureInfo.InvariantCulture,
            out var lat) &&
        lat is >= -90 and <= 90;

    public static bool IsLongitudeValid(string? longitude) =>
        !string.IsNullOrWhiteSpace(longitude) &&
        double.TryParse(
            longitude.Trim(),
            NumberStyles.Float,
            CultureInfo.InvariantCulture,
            out var lon) &&
        lon is >= -180 and <= 180;

    public static bool IsTitleValid(string? title) =>
        !string.IsNullOrWhiteSpace(title) && title.Trim().Length <= 250 && title.Trim().Length >= 3;

    public static bool IsDescriptionValid(string? description) =>
        !string.IsNullOrWhiteSpace(description) &&
        description.Trim().Length is >= 10 and <= 2000;

    public static bool AreDatesValid(DateTime startDate, DateTime? endDate) =>
        startDate != default && (!endDate.HasValue || endDate.Value >= startDate);

    public static bool IsSearchTermValid(string? searchTerm) =>
        string.IsNullOrWhiteSpace(searchTerm) ||
        searchTerm.Trim().Length <= MaxSearchTermLength;

    public static bool IsPageSizeValid(int pageSize) =>
        pageSize is >= 1 and <= 100;

    public static bool IsPageValid(int page) =>
        page >= 1;

    public static bool IsSortByValid(string? sortBy) =>
        string.IsNullOrWhiteSpace(sortBy) ||
        ValidSortOptions.Contains(sortBy.Trim());

    public static bool IsSortDirectionValid(string? sortBy)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
            return true;

        var value = sortBy.Trim();
        return value.EndsWith("_asc", StringComparison.OrdinalIgnoreCase) ||
               value.EndsWith("_desc", StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsScheduleValid(
        EventScheduleRequestDto? schedule,
        DateTime eventStartDate,
        DateTime? eventEndDate) =>
        schedule is null || IsScheduleValid(
            schedule.StartDate,
            schedule.EndDate,
            schedule.StartTime,
            schedule.EndTime,
            schedule.TimeZone,
            schedule.RepeatDays,
            eventStartDate,
            eventEndDate);

    public static bool IsScheduleValid(
        ScheduleModel? schedule,
        DateTime eventStartDate,
        DateTime? eventEndDate) =>
        schedule is null || IsScheduleValid(
            schedule.StartDate,
            schedule.EndDate,
            schedule.StartTime,
            schedule.EndTime,
            schedule.TimeZone,
            schedule.RepeatDays,
            eventStartDate,
            eventEndDate);

    private static bool IsScheduleValid(
        DateTime scheduleStartDate,
        DateTime? scheduleEndDate,
        string? startTime,
        string? endTime,
        string? timeZone,
        IEnumerable<DayOfWeek>? repeatDays,
        DateTime eventStartDate,
        DateTime? eventEndDate)
    {
        if (scheduleStartDate == default || eventStartDate == default)
            return false;

        if (scheduleEndDate.HasValue &&
            scheduleEndDate.Value.Date < scheduleStartDate.Date)
        {
            return false;
        }

        if (scheduleStartDate.Date < eventStartDate.Date)
            return false;

        if (eventEndDate.HasValue)
        {
            if (scheduleStartDate.Date > eventEndDate.Value.Date ||
                scheduleEndDate?.Date > eventEndDate.Value.Date)
            {
                return false;
            }
        }

        if (!AreScheduleTimesValid(startTime, endTime) ||
            !IsTimeZoneValid(timeZone) ||
            !AreRepeatDaysValid(repeatDays))
        {
            return false;
        }

        return true;
    }

    private static bool AreScheduleTimesValid(string? startTime, string? endTime)
    {
        if (startTime is null && endTime is null)
            return true;

        if (string.IsNullOrWhiteSpace(startTime) ||
            string.IsNullOrWhiteSpace(endTime) ||
            !TryParseScheduleTime(startTime, out var parsedStartTime) ||
            !TryParseScheduleTime(endTime, out var parsedEndTime))
        {
            return false;
        }

        return parsedEndTime >= parsedStartTime;
    }

    private static bool TryParseScheduleTime(
        string value,
        out TimeSpan time)
    {
        if (DateTime.TryParseExact(
                value.Trim(),
                new[] { "H:mm", "HH:mm" },
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var parsed))
        {
            time = parsed.TimeOfDay;
            return true;
        }

        time = default;
        return false;
    }

    private static bool IsTimeZoneValid(string? timeZone)
    {
        if (timeZone is null)
            return true;

        if (string.IsNullOrWhiteSpace(timeZone))
            return false;

        try
        {
            TimeZoneInfo.FindSystemTimeZoneById(timeZone.Trim());
            return true;
        }
        catch (TimeZoneNotFoundException)
        {
            return false;
        }
        catch (InvalidTimeZoneException)
        {
            return false;
        }
    }

    private static bool AreRepeatDaysValid(
        IEnumerable<DayOfWeek>? repeatDays)
    {
        if (repeatDays is null)
            return true;

        var days = repeatDays.ToList();

        return days.Count == days.Distinct().Count() &&
               days.All(day => Enum.IsDefined(day));
    }

    public static bool IsOfferNameValid(string? name) =>
        !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= 250;

    public static bool IsOfferCurrencyValid(string? currency) =>
        !string.IsNullOrWhiteSpace(currency) &&
        currency.Trim().Length == 3 &&
        currency.Trim().All(char.IsAsciiLetter);

    public static bool IsOfferAvailabilityValid(string? availability)
    {
        if (string.IsNullOrWhiteSpace(availability))
            return false;

        const string schemaOrgPrefix = "https://schema.org/";
        var value = availability.Trim();

        return value.StartsWith(schemaOrgPrefix, StringComparison.OrdinalIgnoreCase) &&
               ValidOfferAvailabilities.Contains(
                   value[schemaOrgPrefix.Length..]);
    }

    public static bool IsOfferValid(
        EventOfferRequestDto? offer,
        DateTime eventStartDate,
        DateTime? eventEndDate) =>
        offer is null ||
        (IsOfferNameValid(offer.Name) &&
         offer.Price >= 0 &&
         IsOfferCurrencyValid(offer.PriceCurrency) &&
         IsOfferAvailabilityValid(offer.Availability) &&
         IsOptionalUrlValid(offer.Url) &&
         IsOfferValidFromValid(offer.ValidFrom, eventStartDate, eventEndDate));

    public static bool IsOfferValid(
        OfferModel? offer,
        DateTime eventStartDate,
        DateTime? eventEndDate) =>
        offer is null ||
        (IsOfferNameValid(offer.Name) &&
         offer.Price >= 0 &&
         IsOfferCurrencyValid(offer.PriceCurrency) &&
         IsOfferAvailabilityValid(offer.Availability) &&
         IsOptionalUrlValid(offer.Url) &&
         IsOfferValidFromValid(offer.ValidFrom, eventStartDate, eventEndDate));

    private static bool IsOfferValidFromValid(
        DateTime? validFrom,
        DateTime eventStartDate,
        DateTime? eventEndDate)
    {
        if (!validFrom.HasValue)
            return true;

        if (validFrom.Value == default || eventStartDate == default)
            return false;

        return !eventEndDate.HasValue || validFrom.Value <= eventEndDate.Value;
    }

    public static bool AreOffersValid(
        IEnumerable<EventOfferRequestDto>? offers,
        DateTime eventStartDate,
        DateTime? eventEndDate)
    {
        if (offers is null)
            return true;

        var offerList = offers.ToList();

        if (offerList.Count > MaxOffers ||
            !offerList.All(offer =>
                offer is not null &&
                IsOfferValid(offer, eventStartDate, eventEndDate)))
        {
            return false;
        }

        var identities = offerList
            .Select(GetOfferIdentity)
            .ToList();

        return identities.Count == identities.Distinct().Count();
    }

    public static bool AreOffersValid(
        IEnumerable<OfferModel>? offers,
        DateTime eventStartDate,
        DateTime? eventEndDate)
    {
        if (offers is null)
            return true;

        var offerList = offers.ToList();

        if (offerList.Count > MaxOffers ||
            !offerList.All(offer =>
                offer is not null &&
                IsOfferValid(offer, eventStartDate, eventEndDate)))
        {
            return false;
        }

        var identities = offerList
            .Select(GetOfferIdentity)
            .ToList();

        return identities.Count == identities.Distinct().Count();
    }

    private static OfferIdentity GetOfferIdentity(EventOfferRequestDto offer) =>
        new(
            offer.Name.Trim().ToUpperInvariant(),
            offer.PriceCurrency.Trim().ToUpperInvariant(),
            offer.Price,
            offer.ValidFrom);

    private static OfferIdentity GetOfferIdentity(OfferModel offer) =>
        new(
            offer.Name.Trim().ToUpperInvariant(),
            offer.PriceCurrency.Trim().ToUpperInvariant(),
            offer.Price,
            offer.ValidFrom);

    private readonly record struct OfferIdentity(
        string Name,
        string PriceCurrency,
        decimal Price,
        DateTime? ValidFrom);

    public static bool IsAlternateNameValid(string? alternateName) =>
        string.IsNullOrWhiteSpace(alternateName) ||
        alternateName.Trim().Length <= 250;

    public static bool IsAgeRatingValid(int? ageRating) =>
        !ageRating.HasValue || ageRating.Value >= 0;

    public static bool IsMaximumAttendeeCapacityValid(int? capacity) =>
        !capacity.HasValue || capacity.Value >= 0;

    public static bool IsDoorTimeValid(
        DateTime? doorTime,
        DateTime eventStartDate) =>
        !doorTime.HasValue ||
        (doorTime.Value != default && doorTime.Value <= eventStartDate);

    public static bool AreKeywordsValid(IEnumerable<string>? keywords)
    {
        if (keywords is null)
            return true;

        var keywordList = keywords.ToList();

        if (keywordList.Count > MaxKeywords ||
            keywordList.Any(keyword =>
                string.IsNullOrWhiteSpace(keyword) ||
                keyword.Trim().Length > MaxKeywordLength))
        {
            return false;
        }

        var normalizedKeywords = keywordList
            .Select(keyword => keyword.Trim().ToUpperInvariant())
            .ToList();

        return normalizedKeywords.Count == normalizedKeywords.Distinct().Count();
    }

    public static bool IsCreateLocationValid(EventLocationRequestDto? location) =>
        location is not null &&
        !string.IsNullOrWhiteSpace(location.Name) &&
        location.Name.Trim().Length <= 250 &&
        IsLocalityValid(location.Locality) &&
        IsCountryValid(location.Country) &&
        AreCoordinatesValid(location.Latitude, location.Longitude);

    public static bool IsLocationValid(EventLocationRequestDto? location) =>
        location is not null &&
        !string.IsNullOrWhiteSpace(location.Name) &&
        location.Name.Trim().Length <= 250 &&
        IsLocalityValid(location.Locality) &&
        IsDistrictValidForRegion(location.District, location.Region) &&
        IsRegionValid(location.Region) &&
        IsCountryValid(location.Country) &&
        IsDicoCodeValid(location.DicoCode) &&
        IsLatitudeValid(location.Latitude) &&
        IsLongitudeValid(location.Longitude);

    public static bool AreCoordinatesValid(string? latitude, string? longitude) =>
        (string.IsNullOrWhiteSpace(latitude) && string.IsNullOrWhiteSpace(longitude)) ||
        (!string.IsNullOrWhiteSpace(latitude) &&
         !string.IsNullOrWhiteSpace(longitude) &&
         IsLatitudeValid(latitude) &&
         IsLongitudeValid(longitude));

    private static bool IsDistrictValidForRegion(
        DistrictName? district,
        Nuts2Region? region) =>
        district.HasValue
            ? IsDistrictValid(district)
            : region is Nuts2Region.PT20 or Nuts2Region.PT30;

    public static bool IsSourceUrlValid(string? sourceUrl)
    {
        if (string.IsNullOrWhiteSpace(sourceUrl))
            return false;

        return Uri.TryCreate(sourceUrl.Trim(), UriKind.Absolute, out var uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) &&
               uri.Host.Contains('.');
    }

    public static bool IsAgentNameValid(string? name) =>
        !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= 250;

    public static bool IsAgentTypeValid(AgentType? type) =>
        type.HasValue && Enum.IsDefined(type.Value);

    public static bool IsOptionalUrlValid(string? url) =>
        url is null || IsSourceUrlValid(url);

    public static bool IsAgentValid(EventAgentRequestDto? agent) =>
        agent is null ||
        (IsAgentNameValid(agent.Name) &&
         IsAgentTypeValid(agent.Type) &&
         IsOptionalUrlValid(agent.Url) &&
         IsOptionalUrlValid(agent.SameAs));

    public static bool ArePerformersValid(
        IEnumerable<EventAgentRequestDto>? performers)
    {
        if (performers is null)
            return true;

        var performerList = performers.ToList();

        return performerList.Count <= MaxPerformers &&
               performerList.All(performer =>
                   performer is not null && IsAgentValid(performer));
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
            candidate.Location!.District,
            candidate.StartDate);
    }

    public static async Task<bool> IsDuplicateOnCreate(
        CreateEventDto candidate,
        DistrictName? district,
        EventService eventService)
    {
        if (!IsTitleValid(candidate.Title) || candidate.StartDate == default)
            return false;

        var eventsResult = await eventService.GetAllEvents();
        if (!eventsResult.IsSuccess || eventsResult.Value is null)
            return false;

        return HasDuplicate(
            eventsResult.Value,
            null,
            candidate.Title,
            district,
            candidate.StartDate);
    }

    public static async Task<bool> IsDuplicateOnUpdate(
        string eventId,
        string? title,
        DistrictName? district,
        DateTime startDate,
        EventService eventService)
    {
        if (!IsTitleValid(title) ||
            (district.HasValue && !IsDistrictValid(district)) ||
            startDate == default)
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
        DistrictName? district,
        DateTime startDate)
    {
        if (!IsTitleValid(title) ||
            (district.HasValue && !IsDistrictValid(district)) ||
            startDate == default)
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
