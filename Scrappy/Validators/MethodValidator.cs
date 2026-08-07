

using System;
using System.Linq;
using Scrappy.DTOs;
using Scrappy.Models;
using Scrappy.Services;


namespace Scrappy.Validators;

public partial class Validator
{
    public static bool IsPatchValid(UpdateEventDto dto, DistrictEvent existingEvent, EventService eventService)
    {
        string finalTitle = !string.IsNullOrWhiteSpace(dto.Title) 
            ? dto.Title.Trim() 
            : existingEvent.Event.Title.Trim();

        string finalDistrict = !string.IsNullOrWhiteSpace(dto.District) 
        ? dto.District.Trim() 
        : existingEvent.District.ToString();
        
        DateTime finalStartDate = !string.IsNullOrWhiteSpace(dto.StartDate) && Event.ParsingDate(dto.StartDate).HasValue
            ? Event.ParsingDate(dto.StartDate)!.Value
            : existingEvent.Event.StartDate;
        
        
        if (dto == null || existingEvent == null)
            return false;

        if (!string.IsNullOrWhiteSpace(dto.Title))
        {
            if (!IsTitleValidAndAvailable(dto.Title, eventService))
                return false;
        }

        if (!string.IsNullOrWhiteSpace(dto.District))
        {
            if (!IsDistrictValid(dto.District))
                return false;
        }

        if (!string.IsNullOrWhiteSpace(dto.Type))
        {
            if (!IsTypeValid(dto.Type))
                return false;
        }

        if (!string.IsNullOrWhiteSpace(dto.Description))
        {
            if (!IsDescriptionValid(dto.Description))
                return false;
        }

        if (!string.IsNullOrWhiteSpace(dto.StartDate))
        {
            if (!IsDateValid(dto.StartDate))
                return false;
        }

        if (!string.IsNullOrWhiteSpace(dto.EndDate))
        {
            if (!IsDateValid(dto.EndDate))
                return false;
        }

        if (!AreDatesValid(dto.StartDate, dto.EndDate))
            return false;

        return true;
    }

    public static bool IsDeleteValid()
    {
        return true;
    }

    public static bool IsGetValid()
    {
        return true;
    }
}