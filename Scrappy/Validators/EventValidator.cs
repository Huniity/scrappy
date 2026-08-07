

using System;
using System.Linq;
using Scrappy.DTOs;
using Scrappy.Models;
using Scrappy.Services;

namespace Scrappy.Validators;


public partial class Validator
{
    public static bool IsDistrictValid(string? district)
    {
        if (string.IsNullOrWhiteSpace(district)) return false;

        return Enum.TryParse<DistrictName>(district, true, out var parsedDistrict) && Enum.IsDefined(parsedDistrict);
    }

    public static bool IsTitleValidAndAvailable(string? title, EventService eventService)
    {
        if (string.IsNullOrWhiteSpace(title)) return false;
        string trimmedTitle = title.Trim();
        if (trimmedTitle.Length > 250) return false;

        var eventsResult = eventService.GetAllEvents();
        if (!eventsResult.IsSuccess || eventsResult.Value is null)
        {   
            return true;
        }

        bool isDuplicated = eventsResult.Value.Any(e => e.Event.Title != null && e.Event.Title.Trim().Equals(trimmedTitle, StringComparison.OrdinalIgnoreCase));
        return !isDuplicated;
    }

    public static bool IsTypeValid(string? type)
    {
        if (string.IsNullOrWhiteSpace(type)) return false;

        return Enum.TryParse<EventType>(type, true, out var parsedType) && Enum.IsDefined(parsedType);
    }

    public static bool IsDescriptionValid(string? description)
    {
        if (string.IsNullOrWhiteSpace(description)) return true;
        string trimmedDescription = description.Trim();
        if (trimmedDescription.Length > 2000) return false;
        
        return true;
    }

    public static bool IsDateValid(string? date)
    {
        if (string.IsNullOrWhiteSpace(date)) return false;

        return Event.ParsingDate(date).HasValue;
    }

    public static bool AreDatesValid(string? startDateStr, string? endDateStr)
    {
        if (!IsDateValid(startDateStr)) return false;
        if (string.IsNullOrWhiteSpace(endDateStr)) return true;
        
        DateTime startDate = Event.ParsingDate(startDateStr!)!.Value;
        DateTime? endDate = Event.ParsingDate(endDateStr);
        
        if (!endDate.HasValue) return false;

        return endDate >= startDate;
    }


    public static bool IsLocationValid(string? location)
    {
        if (string.IsNullOrWhiteSpace(location)) return true;
        string trimmedLocation = location.Trim();
        if (trimmedLocation.Length > 250) return false;

        return true;
    }

    public static bool IsSourceUrlValid(string? sourceUrl)
    {
        if (string.IsNullOrWhiteSpace(sourceUrl)) return false;
        string trimmedUrl = sourceUrl.Trim();
        if (Uri.TryCreate(trimmedUrl, UriKind.Absolute, out Uri? uriResult))
        {
            return (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps)
            && uriResult.Host.Contains('.');
        }
        return false;
    }
}