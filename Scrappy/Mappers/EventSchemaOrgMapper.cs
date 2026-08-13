

using System.Xml;
using Scrappy.Models.Entities;
using Scrappy.Models;
using Scrappy.DTOs.SchemaOrg;

namespace Scrappy.Mappers;

/// <summary>
/// Provides mapping methods to convert between the DistrictEvent entity and Schema.org DTOs.
/// </summary>
public static class EventSchemaOrgMapper
{
    /// <summary>
    /// Converts a DistrictEvent entity to a SchemaOrgEventDto, mapping all relevant properties from the entity to the DTO.
    /// </summary>
    public static SchemaOrgEventDto ToSchemaOrgDto(this DistrictEvent entity, string baseUrl = "https://localhost:5001")
    {
        var dto = new SchemaOrgEventDto
        {
            Context = "https://schema.org",
            Type = "Event",
            Id = $"{baseUrl}/events/{entity.Id}",
            Name = entity.Event.Name,
            Description = entity.Event.Description,
            AlternateName = entity.Event.AlternateName,
            AdditionalType = entity.Event.AdditionalType,
            Url = entity.Event.Url,
            Image = entity.Event.Image,
            StartDate = entity.Event.StartDate.ToString("o"),
            EndDate = entity.Event.EndDate?.ToString("o"),
            DoorTime = entity.Event.DoorTime?.ToString("o"),
            Duration = entity.Duration.HasValue ? XmlConvert.ToString(entity.Duration.Value) : null,            Category = entity.Event.Category,
            IsAccessibleForFree = entity.Event.IsAccessibleForFree,
            TypicalAgeRange = entity.AgeRating.HasValue ? $"{entity.AgeRating}+" : null,
            MaximumAttendeeCapacity = entity.Event.MaximumAttendeeCapacity,
            Keywords = entity.Event.Keywords,
            EventStatus = $"https://schema.org/Event{entity.EventStatus}",
            Location = entity.Event.Location?.ToSchemaPlace(),
            Owner = entity.Event.Owner?.Select(m => m.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Organizer = entity.Event.Organizer?.Select(o => o.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Promoter = entity.Event.Promoter?.Select(p => p.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Funder = entity.Event.Funder?.Select(f => f.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Performer = entity.Event.Performer?.Select(p => p.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Actor = entity.Event.Actor?.Select(a => a.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Director = entity.Event.Director?.Select(d => d.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Composer = entity.Event.Composer?.Select(c => c.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            Audience = entity.Event.Audience?.Select(a => a.ToSchemaAgent()).OfType<SchemaOrgAgentDto>().ToList(),
            EventSchedule = entity.Event.EventSchedule?.ToSchemaOrgSchedule(),
            SubEvent = entity.Event.SubEvent?.Select(e => e.ToSchemaOrgDto(baseUrl)).ToList(),
            SuperEvent = entity.Event.SuperEvent?.ToSchemaOrgDto(baseUrl),
            Offers = entity.Event.Offers?.Select(o => o.ToSchemaOrgOffer()).ToList(),
        };

        dto.AdditionalProperties.Add(new SchemaOrgPropertyValueDto { Name = "districtName", Value = entity.District.ToString() });
        dto.AdditionalProperties.Add(new SchemaOrgPropertyValueDto { Name = "qualityScore", Value = entity.Event.QualityScore });
        dto.AdditionalProperties.Add(new SchemaOrgPropertyValueDto { Name = "physicalAccessibility", Value = entity.Event.PhysicalAccessibility });

        return dto;
    }

    /// <summary>
    ///  Converts a LocationModel to a SchemaOrgPlaceDto, mapping all relevant properties from the model to the DTO.
    /// </summary>
    /// <param name="location"></param>
    /// <returns></returns>
    public static SchemaOrgPlaceDto ToSchemaPlace(this LocationModel location)
    {
        return new SchemaOrgPlaceDto
        {
            Name = location.Name,
            Address = new SchemaOrgAddressDto
            {
                Locality = location.Locality,
                Region = location.Region,
                Country = "PT",
                DicoCode = location.DicoCode ?? string.Empty
            },
            Geo = location.Coordinates != null ? new SchemaOrgGeoDto
            {
                Latitude = location.Coordinates.latitude,
                Longitude = location.Coordinates.longitude
            } : null
        };
    }

    /// <summary>
    /// Converts an AgentModel to a SchemaOrgAgentDto, mapping all relevant properties from the model to the DTO.
    /// </summary>
    /// <param name="agent"></param>
    /// <returns></returns>
    public static SchemaOrgAgentDto? ToSchemaAgent(this AgentModel agent)
    {
        if (agent == null) return null;

        return new SchemaOrgAgentDto
        {
            Type = agent.Type,
            Name = agent.Name,
            Url = agent.Url,
            SameAs = agent.SameAs,
        };
    }

    /// <summary>
    /// Converts a ScheduleModel to a SchemaOrgScheduleDto, mapping all relevant properties from the model to the DTO.
    /// </summary>
    /// <param name="schedule"></param>
    /// <returns></returns>
    public static SchemaOrgScheduleDto ToSchemaOrgSchedule(this ScheduleModel schedule)
    {
      return new SchemaOrgScheduleDto
      {
          Type = "Schedule",
          StartDate = schedule.StartDate.ToString("yyyy-MM-dd"),
          EndDate = schedule.EndDate?.ToString("yyyy-MM-dd"),
          StartTime = schedule.StartTime?.ToString("HH:mm:ss"),
          EndTime = schedule.EndTime?.ToString("HH:mm:ss"),
          ScheduleTimezone = "Europe/Lisbon",
          ByDay = schedule.RepeatDays?.Select(d => $"https://schema.org/{d}").ToList(),

      };
    }

    /// <summary>
    /// Converts an OfferModel to a SchemaOrgOfferDto, mapping all relevant properties from the model to the DTO.
    /// </summary>
    /// <param name="offer"></param>
    /// <returns></returns>
    public static SchemaOrgOfferDto ToSchemaOrgOffer(this OfferModel offer)
    {
        return new SchemaOrgOfferDto
        {
            Type = "Offer",
            Name = offer.Name,
            Price = offer.Price.ToString("F2", System.Globalization.CultureInfo.InvariantCulture),            PriceCurrency = "EUR",
            Availability = offer.Availability ??  "https://schema.org/InStock",
            Url = offer.Url,
            ValidFrom = offer.ValidFrom?.ToString("o"),
        };
    }
}
