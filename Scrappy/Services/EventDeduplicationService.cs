using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Services;

public static partial class EventDeduplicationService
{
    private static readonly HashSet<string> IgnoredTitleWords =
        new(StringComparer.Ordinal) { "com" };

    public static DistrictEvent? FindMatch(
        IEnumerable<DistrictEvent> candidates,
        DistrictEvent incoming)
    {
        return candidates
            .Where(candidate => IsMatch(candidate, incoming))
            .OrderByDescending(candidate => MatchScore(candidate, incoming))
            .FirstOrDefault();
    }

    public static bool IsMatch(DistrictEvent existing, DistrictEvent incoming)
    {
        var existingLocation = existing.Event.Location;
        var incomingLocation = incoming.Event.Location;

        if (existingLocation is null || incomingLocation is null ||
            existingLocation.Locality != incomingLocation.Locality ||
            LocalDate(existing.Event.StartDate) != LocalDate(incoming.Event.StartDate))
            return false;

        var titleSimilarity = TokenSimilarity(existing.Event.Title, incoming.Event.Title);
        if (titleSimilarity < 0.8)
            return false;

        var sameVenue = Normalize(existingLocation.Name) == Normalize(incomingLocation.Name);
        var nearby = DistanceMetres(existingLocation, incomingLocation) is <= 150;
        if (!sameVenue && !nearby)
            return false;

        var minutesApart = Math.Abs(
            (existing.Event.StartDate - incoming.Event.StartDate).TotalMinutes);

        if (minutesApart == 0)
            return true;

        return DifferentSources(existing.Event.SourceUrl, incoming.Event.SourceUrl) &&
               minutesApart <= 90 && sameVenue && nearby;
    }

    public static IReadOnlyList<string> Merge(
        DistrictEvent existing,
        DistrictEvent incoming)
    {
        var changed = new List<string>();
        var target = existing.Event;
        var source = incoming.Event;

        // BOL is the ticketing source and its advertised session time is the
        // safest canonical value when an editorial source differs by up to the
        // matching tolerance.
        if (IsBolSource(source.SourceUrl) && !IsBolSource(target.SourceUrl))
        {
            if (target.StartDate != source.StartDate)
            {
                target.StartDate = source.StartDate;
                changed.Add("startDate");
            }

            target.SourceUrl = source.SourceUrl;
            changed.Add("sourceUrl");
        }

        if (source.Description.Trim().Length > target.Description.Trim().Length)
        { target.Description = source.Description.Trim(); changed.Add("description"); }
        if (string.IsNullOrWhiteSpace(target.AlternateName) && !string.IsNullOrWhiteSpace(source.AlternateName))
        { target.AlternateName = source.AlternateName.Trim(); changed.Add("alternateName"); }
        if (string.IsNullOrWhiteSpace(target.ImageUrl) && !string.IsNullOrWhiteSpace(source.ImageUrl))
        { target.ImageUrl = source.ImageUrl.Trim(); changed.Add("imageUrl"); }
        if (string.IsNullOrWhiteSpace(target.Duration) && !string.IsNullOrWhiteSpace(source.Duration))
        { target.Duration = source.Duration.Trim(); changed.Add("duration"); }

        if ((target.Type is null || target.Type == EventType.Outro) &&
            source.Type is not null && source.Type != EventType.Outro)
        {
            target.Type = source.Type;
            changed.Add("type");
        }

        if (target.EndDate is null || target.EndDate <= target.StartDate)
        {
            var candidateEnd = source.EndDate;
            if (candidateEnd.HasValue && candidateEnd.Value > target.StartDate)
            {
                target.EndDate = candidateEnd;
                changed.Add("endDate");
            }
        }

        if (TryParseDuration(target.Duration, out var duration))
        {
            var durationEnd = target.StartDate.Add(duration);
            if (target.EndDate is null || target.EndDate <= target.StartDate ||
                target.EndDate.Value - target.StartDate < duration)
            {
                target.EndDate = durationEnd;
                if (!changed.Contains("endDate")) changed.Add("endDate");
            }
        }

        if (target.DoorTime is null && source.DoorTime is not null) { target.DoorTime = source.DoorTime; changed.Add("doorTime"); }
        if (target.IsAccessibleForFree is null && source.IsAccessibleForFree is not null) { target.IsAccessibleForFree = source.IsAccessibleForFree; changed.Add("isAccessibleForFree"); }
        if (target.AgeRating is null && source.AgeRating is not null) { target.AgeRating = source.AgeRating; changed.Add("ageRating"); }
        if (target.MaximumAttendeeCapacity is null && source.MaximumAttendeeCapacity is not null) { target.MaximumAttendeeCapacity = source.MaximumAttendeeCapacity; changed.Add("maximumAttendeeCapacity"); }
        if (target.AttendanceMode is null && source.AttendanceMode is not null) { target.AttendanceMode = source.AttendanceMode; changed.Add("attendanceMode"); }
        if (target.Schedule is null && source.Schedule is not null) { target.Schedule = source.Schedule; changed.Add("schedule"); }

        MergeStrings(target.Keywords, source.Keywords, "keywords", changed);
        MergeAgents(target.Organizer, source.Organizer, "organizer", changed);
        MergeAgents(target.Promoter, source.Promoter, "promoter", changed);
        MergeAgents(target.Performers, source.Performers, "performers", changed);
        MergeAgents(target.Maintainer, source.Maintainer, "maintainer", changed);
        MergeAgents(target.Funder, source.Funder, "funder", changed);
        MergeAgents(target.Actor, source.Actor, "actor", changed);
        MergeAgents(target.Director, source.Director, "director", changed);
        MergeAgents(target.Composer, source.Composer, "composer", changed);
        MergeOffers(target.Offers, source.Offers, changed);
        MergeLocation(target.Location, source.Location, changed);

        foreach (var url in source.SourceUrls.Append(source.SourceUrl)
                     .Where(url => !string.IsNullOrWhiteSpace(url)))
        {
            if (!target.SourceUrls.Contains(url, StringComparer.OrdinalIgnoreCase))
            {
                target.SourceUrls.Add(url);
                if (!changed.Contains("sourceUrls")) changed.Add("sourceUrls");
            }
        }

        target.QualityScore = EventQualityService.ComputeQualityScore(
            target.Description, target.StartDate, target.Location?.Name, target.Type);

        return changed;
    }

    private static int MatchScore(DistrictEvent left, DistrictEvent right) =>
        (int)(TokenSimilarity(left.Event.Title, right.Event.Title) * 100) +
        (Normalize(left.Event.Location?.Name ?? "") == Normalize(right.Event.Location?.Name ?? "") ? 20 : 0) +
        (DistanceMetres(left.Event.Location!, right.Event.Location!) is <= 150 ? 20 : 0);

    private static DateOnly LocalDate(DateTime value)
    {
        var utc = value.Kind == DateTimeKind.Utc ? value : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        var zone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");
        return DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(utc, zone));
    }

    private static bool DifferentSources(string first, string second) =>
        Uri.TryCreate(first, UriKind.Absolute, out var firstUri) &&
        Uri.TryCreate(second, UriKind.Absolute, out var secondUri) &&
        !firstUri.Host.Equals(secondUri.Host, StringComparison.OrdinalIgnoreCase);

    private static bool IsBolSource(string sourceUrl) =>
        Uri.TryCreate(sourceUrl, UriKind.Absolute, out var uri) &&
        (uri.Host.Equals("bol.pt", StringComparison.OrdinalIgnoreCase) ||
         uri.Host.EndsWith(".bol.pt", StringComparison.OrdinalIgnoreCase));

    private static bool TryParseDuration(string? value, out TimeSpan duration)
    {
        duration = default;
        if (string.IsNullOrWhiteSpace(value)) return false;

        try
        {
            duration = XmlConvert.ToTimeSpan(value);
            return duration > TimeSpan.Zero;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static double TokenSimilarity(string first, string second)
    {
        var left = TitleTokens(first);
        var right = TitleTokens(second);
        if (left.Count == 0 || right.Count == 0) return 0;
        var intersection = left.Intersect(right).Count();
        var union = left.Union(right).Count();
        return (double)intersection / union;
    }

    private static HashSet<string> TitleTokens(string value) =>
        Normalize(value).Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(token => !IgnoredTitleWords.Contains(token))
            .ToHashSet(StringComparer.Ordinal);

    private static string Normalize(string value)
    {
        var decomposed = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var withoutMarks = new string(decomposed
            .Where(character => CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            .ToArray());
        return NonWordRegex().Replace(withoutMarks, " ").Trim();
    }

    private static double? DistanceMetres(EventLocation left, EventLocation right)
    {
        if (!left.Latitude.HasValue || !left.Longitude.HasValue ||
            !right.Latitude.HasValue || !right.Longitude.HasValue) return null;
        const double radius = 6_371_000;
        var lat1 = left.Latitude.Value * Math.PI / 180;
        var lat2 = right.Latitude.Value * Math.PI / 180;
        var deltaLat = (right.Latitude.Value - left.Latitude.Value) * Math.PI / 180;
        var deltaLon = (right.Longitude.Value - left.Longitude.Value) * Math.PI / 180;
        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);
        return radius * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static void MergeStrings(List<string> target, IEnumerable<string> source, string field, List<string> changed)
    { foreach (var item in source.Where(item => !string.IsNullOrWhiteSpace(item))) if (!target.Contains(item, StringComparer.OrdinalIgnoreCase)) { target.Add(item); if (!changed.Contains(field)) changed.Add(field); } }
    private static void MergeAgents(List<AgentModel> target, IEnumerable<AgentModel> source, string field, List<string> changed)
    { foreach (var item in source) if (!target.Any(current => Normalize(current.Name) == Normalize(item.Name))) { target.Add(item); if (!changed.Contains(field)) changed.Add(field); } }
    private static void MergeOffers(List<OfferModel> target, IEnumerable<OfferModel> source, List<string> changed)
    { foreach (var item in source) if (!target.Any(current => current.Price == item.Price && current.PriceCurrency == item.PriceCurrency && current.Url == item.Url)) { target.Add(item); if (!changed.Contains("offers")) changed.Add("offers"); } }

    private static void MergeLocation(EventLocation? target, EventLocation? source, List<string> changed)
    {
        if (target is null || source is null) return;
        if (!string.IsNullOrWhiteSpace(source.StreetAddress) && (target.StreetAddress?.Length ?? 0) < source.StreetAddress.Length)
        { target.StreetAddress = source.StreetAddress.Trim(); changed.Add("location.streetAddress"); }
        if (string.IsNullOrWhiteSpace(target.PostalCode) && !string.IsNullOrWhiteSpace(source.PostalCode))
        { target.PostalCode = source.PostalCode.Trim(); changed.Add("location.postalCode"); }
        if (string.IsNullOrWhiteSpace(target.Url) && !string.IsNullOrWhiteSpace(source.Url))
        { target.Url = source.Url; changed.Add("location.url"); }
        if (string.IsNullOrWhiteSpace(target.SameAs) && !string.IsNullOrWhiteSpace(source.SameAs))
        { target.SameAs = source.SameAs; changed.Add("location.sameAs"); }
        if (target.Latitude is null && source.Latitude is not null) { target.Latitude = source.Latitude; changed.Add("location.latitude"); }
        if (target.Longitude is null && source.Longitude is not null) { target.Longitude = source.Longitude; changed.Add("location.longitude"); }
    }

    [GeneratedRegex(@"[^\p{L}\p{N}]+")]
    private static partial Regex NonWordRegex();
}
