using System.Globalization;
using Scrappy.DTOs.SchemaOrg;
using Scrappy.Extensions;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Mappers;

/// <summary>
/// Provides extension methods for mapping between event entity models and Schema.org DTOs.
///
/// </summary>
public static class EventSchemaOrgMapper
{
    /// <summary> Maps a <see cref="DistrictEvent"/> entity to a <see cref="SchemaOrgEventDto"/>. </summary>
    /// <param name="entity">The <see cref="DistrictEvent"/> entity to map.</param>
    /// <param name="baseUrl">The base URL to use for constructing the event's ID.</param>
    /// <returns>A new <see cref="SchemaOrgEventDto"/> with properties mapped from the provided entity.</returns>
    public static SchemaOrgEventDto ToSchemaOrgDto(this DistrictEvent entity, string baseUrl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(baseUrl);
        var eventModel = entity.Event;

        var dto = new SchemaOrgEventDto
        {
            Context = "https://schema.org",
            Type = "Event",
            Id = $"{baseUrl.TrimEnd('/')}/events/{entity.Id}",
            Name = eventModel.Title,
            Description = eventModel.Description ?? string.Empty,
            AlternateName = NullIfEmpty(eventModel.AlternateName),
            Url = NullIfEmpty(eventModel.SourceUrl),
            Image = NullIfEmpty(eventModel.ImageUrl),
            StartDate = eventModel.StartDate.ToString("O", CultureInfo.InvariantCulture),
            EndDate = eventModel.EndDate?.ToString("O", CultureInfo.InvariantCulture),
            DoorTime = eventModel.DoorTime?.ToString("O", CultureInfo.InvariantCulture),
            Duration = eventModel.Duration,
            additionalType = eventModel.Type?.ToString() ?? string.Empty,
            IsAccessibleForFree = eventModel.IsAccessibleForFree,
            TypicalAgeRange = eventModel.AgeRating is int age ? $"{age}+" : null,
            MaximumAttendeeCapacity = eventModel.MaximumAttendeeCapacity,
            Keywords = eventModel.Keywords,
            EventStatus = ToSchemaEventStatus(eventModel.Status),
            Location = eventModel.Location?.ToSchemaPlace(),
            Organizer = eventModel.Organizer.Select(ToSchemaAgent).ToList() ?? new(),
            Promoter = eventModel.Promoter?.Select(ToSchemaAgent).ToList() ?? new(),
            Performer = eventModel.Performers.Select(ToSchemaAgent).ToList() ?? new(),
            Maintainer = eventModel.Maintainer.Select(ToSchemaAgent).ToList() ?? new(),
            Actor = eventModel.Actor.Select(ToSchemaAgent).ToList() ?? new(),
            Director = eventModel.Director.Select(ToSchemaAgent).ToList() ?? new(),
            Composer = eventModel.Composer.Select(ToSchemaAgent).ToList() ?? new(),
            Funder = eventModel.Funder.Select(ToSchemaAgent).ToList() ?? new(),
            Audience = eventModel.Audience.Select(ToSchemaAudience).ToList() ?? new(),
            EventAttendanceMode = ToSchemaAttendanceMode(eventModel.AttendanceMode),
            Offers = eventModel.Offers.Select(ToSchemaOrgOffer).ToList() ?? new(),
            EventSchedule = eventModel.Schedule?.ToSchemaOrgSchedule(),
        };

        dto.AdditionalProperties.Add(new SchemaOrgPropertyValueDto
        {
            Name = "districtName",
            Value = entity.District.HasValue
                ? entity.District.Value.GetDisplayName()
                : string.Empty
        });
        dto.AdditionalProperties.Add(new SchemaOrgPropertyValueDto
        {
            Name = "qualityScore",
            Value = eventModel.QualityScore.ToString(CultureInfo.InvariantCulture)
        });
        dto.AdditionalProperties.Add(new SchemaOrgPropertyValueDto
        {
            Name = "physicalAccessibility",
            Value = eventModel.PhysicalAccessibility.ToString().ToLowerInvariant()
        });

        return dto;
    }

    /// <summary> Maps an <see cref="EventLocation"/> model to a <see cref="SchemaOrgPlaceDto"/>. </summary>
    /// <param name="location">The <see cref="EventLocation"/> model to map.</param>
    /// <returns>A new <see cref="SchemaOrgPlaceDto"/> with properties mapped from the provided model.</returns>
    public static SchemaOrgPlaceDto ToSchemaPlace(this EventLocation location) => new()
    {
        Name = location.Name,
        Url = location.Url,
        SameAs = location.SameAs,
        Address = new SchemaOrgAddressDto
        {
            StreetAddress = location.StreetAddress,
            PostalCode = location.PostalCode,
            Locality = location.Locality.GetDisplayName(),
            Region = location.Region.GetDisplayName(),
            Country = location.Country,
            DicoCode = location.DicoCode ?? string.Empty
        },
        Geo = location.Latitude.HasValue && location.Longitude.HasValue? new SchemaOrgGeoDto
            {
                Latitude = location.Latitude.Value,
                Longitude = location.Longitude.Value
            }
            : null
    };

    /// <summary> Maps an <see cref="AgentModel"/> to a <see cref="SchemaOrgAgentDto"/>. </summary>
    /// <param name="agent">The <see cref="AgentModel"/> to map.</param>
    /// <returns>A new <see cref="SchemaOrgAgentDto"/> with properties mapped from the provided model.</returns>
    public static SchemaOrgAgentDto ToSchemaAgent(this AgentModel agent) => new()
    {
        Type = agent.Type?.ToString() ?? "Organization",
        Name = agent.Name,
        Url = agent.Url,
        ImageUrl = agent.ImageUrl,
        SameAs = agent.SameAs
    };


    /// <summary> Maps an <see cref="ScheduleModel"/> to a <see cref="SchemaOrgScheduleDto"/>. </summary>
    /// <param name="schedule">The <see cref="ScheduleModel"/> to map.</param>
    /// <returns>A new <see cref="SchemaOrgScheduleDto"/> with properties mapped from the provided model.</returns>
    public static SchemaOrgScheduleDto ToSchemaOrgSchedule(this ScheduleModel schedule) => new()
    {
        Type = "Schedule",
        StartDate = schedule.StartDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        EndDate = schedule.EndDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        StartTime = schedule.StartTime,
        EndTime = schedule.EndTime,
        ScheduleTimezone = schedule.TimeZone,
        ByDay = schedule.RepeatDays?.Select(day => $"https://schema.org/{day}").ToList()
    };

    /// <summary> Maps an <see cref="OfferModel"/> to a <see cref="SchemaOrgOfferDto"/>. </summary>
    /// <param name="offer">The <see cref="OfferModel"/> to map.</param>
    /// <returns>A new <see cref="SchemaOrgOfferDto"/> with properties mapped from the provided model.</returns>
    public static SchemaOrgOfferDto ToSchemaOrgOffer(this OfferModel offer) => new()
    {
        Type = "Offer",
        Name = offer.Name,
        Price = offer.Price.ToString("F2", CultureInfo.InvariantCulture),
        PriceCurrency = offer.PriceCurrency ?? "EUR",
        Availability = offer.Availability ?? "https://schema.org/InStock",
        Url = offer.Url ?? string.Empty,
        ValidFrom = offer.ValidFrom?.ToString("O", CultureInfo.InvariantCulture) ?? string.Empty
    };

    /// <summary> Maps an <see cref="EventStatus"/> to a Schema.org event status URL. </summary>
    /// <param name="status">The <see cref="EventStatus"/> to map.</param>
    /// <returns>A string representing the Schema.org event status URL corresponding to the provided status.</returns>
    private static string ToSchemaEventStatus(EventStatus status) => status switch
    {
        EventStatus.Scheduled => "https://schema.org/EventScheduled",
        EventStatus.Cancelled => "https://schema.org/EventCancelled",
        EventStatus.Postponed => "https://schema.org/EventPostponed",
        EventStatus.Rescheduled => "https://schema.org/EventRescheduled",
        EventStatus.Completed => "https://schema.org/EventCompleted",
        EventStatus.MovedOnline => "https://schema.org/EventMovedOnline",
        _ => "https://schema.org/EventScheduled"
    };

    /// <summary> Returns null if the provided string is null, empty, or whitespace; otherwise, returns the original string. </summary>
    /// <param name="value">The string to check.</param>
    /// <returns>Null if the string is null, empty, or whitespace; otherwise, returns the original string.</returns>
    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;

    /// <summary> Maps an <see cref="AudienceModel"/> to a <see cref="SchemaOrgAudienceDto"/>. </summary>
    /// <param name="audience">The <see cref="AudienceModel"/> to map.</param>
    /// <returns>A new <see cref="SchemaOrgAudienceDto"/> with properties mapped.</returns>
    private static SchemaOrgAudienceDto ToSchemaAudience(AudienceModel audience) => new()
    {
        Name = audience.Name,
        AudienceType = audience.AudienceType ?? string.Empty
    };

    /// <summary> Maps an <see cref="EventAttendanceMode"/> to a Schema.org attendance mode URL. </summary>
    /// <param name="mode">The <see cref="EventAttendanceMode"/> to map.</param>
    /// <returns>A string representing the Schema.org attendance mode URL corresponding to the provided mode.</returns>
    private static string? ToSchemaAttendanceMode(EventAttendanceMode? mode) => mode switch
    {
        EventAttendanceMode.InPerson => "https://schema.org/OfflineEventAttendanceMode",
        EventAttendanceMode.Online => "https://schema.org/OnlineEventAttendanceMode",
        EventAttendanceMode.Hybrid => "https://schema.org/MixedEventAttendanceMode",
        _ => null
    };
}
