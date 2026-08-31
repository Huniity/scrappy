using Scrappy.DTOs.Common;
using Scrappy.DTOs.Responses;
using Scrappy.Extensions;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Mappers;

/// <summary>
/// Provides extension methods for mapping between event entity models and response DTOs.
///
/// </summary> 
public static class EventResponseMapper
{
    /// <summary> Maps a <see cref="DistrictEvent"/> entity to an <see cref="EventResponseDto"/>. </summary>
    /// <param name="entity">The <see cref="DistrictEvent"/> entity to map.</param>
    /// <returns>A new <see cref="EventResponseDto"/> with properties mapped from the provided entity.</returns>
    public static EventResponseDto ToResponseDto(this DistrictEvent entity)
    {
        var eventModel = entity.Event;
        return new EventResponseDto
        {
            Id = entity.Id,
            Title = eventModel.Title,
            Description = eventModel.Description ?? string.Empty,
            AlternateName = eventModel.AlternateName,
            SourceUrl = eventModel.SourceUrl,
            ImageUrl = eventModel.ImageUrl,
            StartDate = eventModel.StartDate,
            EndDate = eventModel.EndDate,
            Duration = eventModel.Duration,
            QualityScore = (double)eventModel.QualityScore,
            Type = eventModel.Type?.ToString() ?? string.Empty,
            Status = eventModel.Status.ToString(),
            IsAccessibleForFree = eventModel.IsAccessibleForFree,
            PhysicalAccessibility = eventModel.PhysicalAccessibility,
            AgeRating = eventModel.AgeRating,
            MaximumAttendeeCapacity = eventModel.MaximumAttendeeCapacity,
            Keywords = eventModel.Keywords,
            Location = eventModel.Location?.ToResponseDto(),
            Organizer = eventModel.Organizer.Select(ToResponseDto).ToList(),
            Promoter = eventModel.Promoter.Select(ToResponseDto).ToList(),
            Performers = eventModel.Performers.Select(ToResponseDto).ToList(),
            Maintainer = eventModel.Maintainer.Select(ToResponseDto).ToList(),
            Actor = eventModel.Actor.Select(ToResponseDto).ToList(),
            Director = eventModel.Director.Select(ToResponseDto).ToList(),
            Composer = eventModel.Composer.Select(ToResponseDto).ToList(),
            Funder = eventModel.Funder.Select(ToResponseDto).ToList(),
            Audience = eventModel.Audience.Select(ToResponseDto).ToList(),
            AttendanceMode = eventModel.AttendanceMode?.ToString(),
            Offers = eventModel.Offers.Select(ToResponseDto).ToList(),
            Schedule = eventModel.Schedule?.ToResponseDto()
        };
    }

    /// <summary> Maps a <see cref="DistrictEvent"/> entity to an <see cref="EventSummaryDto"/>. </summary>
    /// <param name="entity">The <see cref="DistrictEvent"/> entity to map.</param>
    /// <returns>A new <see cref="EventSummaryDto"/> with properties mapped from the provided entity.</returns>
    public static EventSummaryDto ToSummaryDto(this DistrictEvent entity) => new()
    {
        Id = entity.Id,
        Title = entity.Event.Title,
        ImageUrl = entity.Event.ImageUrl,
        StartDate = entity.Event.StartDate,
        Type = entity.Event.Type?.ToString() ?? string.Empty,
        Locality = entity.Event.Location?.Locality.GetDisplayName() ?? string.Empty,
        District = entity.District.HasValue
            ? entity.District.Value.GetDisplayName()
            : string.Empty,
        QualityScore = (double)entity.Event.QualityScore,
        IsAccessibleForFree = entity.Event.IsAccessibleForFree
    };

    /// <summary> Maps a paged result of <see cref="DistrictEvent"/> entities to a paged result of <see cref="EventSummaryDto"/>. </summary>
    /// <param name="source">The paged result of <see cref="DistrictEvent"/> entities to map.</param>
    /// <returns>A new <see cref="PagedResult{EventSummaryDto}"/> with properties mapped from the provided source.</returns>
    public static PagedResult<EventSummaryDto> ToSummaryPagedResult(this PagedResult<DistrictEvent> source) => new()
    {
        Page = source.Page,
        PageSize = source.PageSize,
        TotalCount = source.TotalCount,
        Items = source.Items.Select(ToSummaryDto).ToList()
    };

    /// <summary> Maps an <see cref="EventLocation"/> model to an <see cref="EventLocationResponseDto"/>. </summary>
    /// <param name="location">The <see cref="EventLocation"/> model to map.</param>
    /// <returns>A new <see cref="EventLocationResponseDto"/> with properties mapped from the provided model.</returns>
    private static EventLocationResponseDto ToResponseDto(this EventLocation location) => new()
    {
        Name = location.Name,
        StreetAddress = location.StreetAddress,
        PostalCode = location.PostalCode,
        Locality = location.Locality.GetDisplayName(),
        District = location.District.HasValue
            ? location.District.Value.GetDisplayName()
            : string.Empty,
        Region = location.Region.ToCodeName(),
        Country = location.Country,
        DicoCode = location.DicoCode,
        Url = location.Url,
        SameAs = location.SameAs,
        Latitude = location.Latitude,
        Longitude = location.Longitude
    };

    /// <summary> Maps an <see cref="AgentModel"/> to an <see cref="EventAgentResponseDto"/>. </summary>
    /// <param name="agent">The <see cref="AgentModel"/> to map.</param>
    /// <returns>A new <see cref="EventAgentResponseDto"/> with properties mapped from the provided model.</returns>
    private static EventAgentResponseDto ToResponseDto(this AgentModel agent) => new()
    {
        Name = agent.Name,
        Type = agent.Type?.ToString() ?? string.Empty,
        Url = agent.Url,
        ImageUrl = agent.ImageUrl,
        SameAs = agent.SameAs
    };

    /// <summary> Maps a <see cref="ScheduleModel"/> to an <see cref="EventScheduleResponseDto"/>. </summary>
    /// <param name="schedule">The <see cref="ScheduleModel"/> to map.</param>
    /// <returns>A new <see cref="EventScheduleResponseDto"/> with properties mapped from the provided model.</returns>
    private static EventScheduleResponseDto ToResponseDto(this ScheduleModel schedule) => new()
    {
        StartDate = schedule.StartDate,
        EndDate = schedule.EndDate,
        StartTime = schedule.StartTime,
        EndTime = schedule.EndTime,
        TimeZone = schedule.TimeZone,
        RepeatDays = schedule.RepeatDays?.Select(day => day.ToString()).ToList()
    };

    /// <summary> Maps an <see cref="AudienceModel"/> to an <see cref="EventAudienceResponseDto"/>. </summary>
    /// <param name="audience">The <see cref="AudienceModel"/> to map.</param>
    /// <returns>A new <see cref="EventAudienceResponseDto"/> with properties mapped from the provided model.</returns>
    private static EventAudienceResponseDto ToResponseDto(this AudienceModel audience) => new()
    {
        Name = audience.Name,
        AudienceType = audience.AudienceType
    };

    /// <summary> Maps an <see cref="OfferModel"/> to an <see cref="EventOfferResponseDto"/>. </summary>
    /// <param name="offer">The <see cref="OfferModel"/> to map.</param>
    /// <returns>A new <see cref="EventOfferResponseDto"/> with properties mapped from the provided model.</returns>
    private static EventOfferResponseDto ToResponseDto(this OfferModel offer) => new()
    {
        Name = offer.Name,
        Price = offer.Price,
        PriceCurrency = offer.PriceCurrency,
        Availability = offer.Availability,
        Url = offer.Url,
        ValidFrom = offer.ValidFrom
    };
}
