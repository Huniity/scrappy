

using System.Globalization;
using Scrappy.DTOs.Requests;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Services;


namespace Scrappy.Mappers;

/// <summary>
/// Provides extension methods for mapping between event request DTOs and entity models.
/// 
/// 
/// </summary>
public static class EventRequestMapper
{
    /// <summary> Maps a <see cref="CreateEventDto"/> to a <see cref="DistrictEvent"/> entity. </summary>
    /// <param name="dto">The <see cref="CreateEventDto"/> to map.</param>
    /// <returns>A new <see cref="DistrictEvent"/> entity with properties mapped from the provided DTO.</returns>
    public static DistrictEvent ToEntity(this CreateEventDto dto) => new()
    {
        District = dto.Location.District
            ?? throw new ArgumentException("Location district is required.", nameof(dto)),
        Event = new Event
        {
            Title = dto.Title,
            Description = CreateEventInputNormalizer.NormalizeDescription(
                dto.Description,
                dto.Title),
            AlternateName = dto.AlternateName ?? string.Empty,
            StartDate = CreateEventInputNormalizer.NormalizeStartDate(dto.StartDate),
            EndDate = CreateEventInputNormalizer.NormalizeEndDate(dto.EndDate),
            DoorTime = dto.DoorTime,
            Type = dto.Type,
            SourceUrl = dto.SourceUrl,
            ImageUrl = dto.ImageUrl ?? string.Empty,
            IsAccessibleForFree = dto.IsAccessibleForFree,
            PhysicalAccessibility = dto.PhysicalAccessibility,
            AgeRating = dto.AgeRating,
            MaximumAttendeeCapacity = dto.MaximumAttendeeCapacity,
            Keywords = dto.Keywords,
            Location = dto.Location.ToEventLocation(),
            Organizer = dto.Organizer.Select(ToAgentModel).ToList(),
            Promoter = dto.Promoter.Select(ToAgentModel).ToList(),
            Performers = dto.Performers.Select(ToAgentModel).ToList(),
            Maintainer = dto.Maintainer.Select(ToAgentModel).ToList(),
            Actor = dto.Actor.Select(ToAgentModel).ToList(),
            Director = dto.Director.Select(ToAgentModel).ToList(),
            Composer = dto.Composer.Select(ToAgentModel).ToList(),
            Funder = dto.Funder.Select(ToAgentModel).ToList(),
            Audience = dto.Audience.Select(ToAudienceModel).ToList(),
            Duration = dto.Duration?.Trim(),
            AttendanceMode = dto.AttendanceMode,
            Schedule = dto.Schedule?.ToScheduleModel()
        }
    };

    /// <summary> Maps a <see cref="UpdateEventDto"/> to an existing <see cref="DistrictEvent"/> entity. </summary>
    /// <param name="entity">The existing <see cref="DistrictEvent"/> entity to update.</param>
    /// <param name="dto">The <see cref="UpdateEventDto"/> containing updated values.</param>
    public static void UpdateEntity(this DistrictEvent entity, UpdateEventDto dto)
    {
        var eventModel = entity.Event;

        if (!string.IsNullOrWhiteSpace(dto.Title)) eventModel.Title = dto.Title;
        if (!string.IsNullOrWhiteSpace(dto.Description)) eventModel.Description = dto.Description;
        if (dto.AlternateName is not null) eventModel.AlternateName = dto.AlternateName;
        if (dto.StartDate.HasValue) eventModel.StartDate = dto.StartDate.Value;
        if (dto.EndDate.HasValue) eventModel.EndDate = dto.EndDate;
        if (dto.DoorTime.HasValue) eventModel.DoorTime = dto.DoorTime;
        if (dto.Type.HasValue) eventModel.Type = dto.Type;
        if (!string.IsNullOrWhiteSpace(dto.SourceUrl)) eventModel.SourceUrl = dto.SourceUrl;
        if (dto.ImageUrl is not null) eventModel.ImageUrl = dto.ImageUrl;
        if (dto.IsAccessibleForFree.HasValue) eventModel.IsAccessibleForFree = dto.IsAccessibleForFree.Value;
        if (dto.PhysicalAccessibility.HasValue) eventModel.PhysicalAccessibility = dto.PhysicalAccessibility.Value;
        if (dto.AgeRating.HasValue) eventModel.AgeRating = dto.AgeRating;
        if (dto.MaximumAttendeeCapacity.HasValue) eventModel.MaximumAttendeeCapacity = dto.MaximumAttendeeCapacity;
        if (dto.Keywords is not null) eventModel.Keywords = dto.Keywords;
        if (dto.Location is not null)
        {
            eventModel.Location = dto.Location.ToEventLocation();
            entity.District = dto.Location.District
                ?? throw new ArgumentException("Location district is required.", nameof(dto));
        }
        if (dto.Organizer is not null) eventModel.Organizer = dto.Organizer.Select(ToAgentModel).ToList();
        if (dto.Promoter is not null) eventModel.Promoter = dto.Promoter.Select(ToAgentModel).ToList();
        if (dto.Performers is not null) eventModel.Performers = dto.Performers.Select(ToAgentModel).ToList();
        if (dto.Maintainer is not null) eventModel.Maintainer = dto.Maintainer.Select(ToAgentModel).ToList();
        if (dto.Actor is not null) eventModel.Actor = dto.Actor.Select(ToAgentModel).ToList();
        if (dto.Director is not null) eventModel.Director = dto.Director.Select(ToAgentModel).ToList();
        if (dto.Composer is not null) eventModel.Composer = dto.Composer.Select(ToAgentModel).ToList();
        if (dto.Funder is not null) eventModel.Funder = dto.Funder.Select(ToAgentModel).ToList();
        if (dto.Audience is not null) eventModel.Audience = dto.Audience.Select(ToAudienceModel).ToList();
        if (dto.Duration is not null) eventModel.Duration = dto.Duration?.Trim();
        if (dto.AttendanceMode.HasValue) eventModel.AttendanceMode = dto.AttendanceMode;
        
        if (dto.Schedule is not null) eventModel.Schedule = dto.Schedule.ToScheduleModel();

    }

    /// <summary> Maps a <see cref="EventLocationRequestDto"/> to an <see cref="EventLocation"/> model. </summary>
    /// <param name="dto">The <see cref="EventLocationRequestDto"/> to map.</param>
    /// <returns>A new <see cref="EventLocation"/> model with properties mapped from the provided DTO.</returns>
    public static EventLocation ToEventLocation(this EventLocationRequestDto dto) => new()
    {
        Name = dto.Name,
        StreetAddress = dto.StreetAddress?.Trim(),
        PostalCode = dto.PostalCode?.Trim(),
        Locality = dto.Locality
            ?? throw new ArgumentException("Location locality is required.", nameof(dto)),
        District = dto.District
            ?? throw new ArgumentException("Location district is required.", nameof(dto)),
        Region = dto.Region
            ?? throw new ArgumentException("Location region is required.", nameof(dto)),
        Country = dto.Country,
        DicoCode = dto.DicoCode,
        Url = dto.Url,
        SameAs = dto.SameAs,
        Latitude = ParseCoordinate(dto.Latitude),
        Longitude = ParseCoordinate(dto.Longitude)
    };

    /// <summary> Maps a <see cref="EventAgentRequestDto"/> to an <see cref="AgentModel"/>. </summary>
    /// <param name="dto">The <see cref="EventAgentRequestDto"/> to map.</param>
    /// <returns>A new <see cref="AgentModel"/> with properties mapped from the provided DTO.</returns>
    public static AgentModel ToAgentModel(this EventAgentRequestDto dto) => new()
    {
        Name = dto.Name,
        Type = dto.Type,
        Url = dto.Url,
        SameAs = dto.SameAs,
        ImageUrl = dto.ImageUrl,
    };

    /// <summary> Maps a <see cref="EventScheduleRequestDto"/> to a <see cref="ScheduleModel"/>. </summary>
    /// <param name="dto">The <see cref="EventScheduleRequestDto"/> to map.</param>
    /// <returns>A new <see cref="ScheduleModel"/> with properties mapped from the provided DTO.</returns>
    public static ScheduleModel ToScheduleModel(this EventScheduleRequestDto dto) => new()
    {
        StartDate = dto.StartDate,
        EndDate = dto.EndDate,
        StartTime = dto.StartTime,
        EndTime = dto.EndTime,
        TimeZone = dto.TimeZone ?? "Europe/Lisbon",
        RepeatDays = dto.RepeatDays
    };

    /// <summary> Parses a string representation of a coordinate into a nullable double. </summary>
    /// <param name="value">The string representation of the coordinate.</param>
    /// <returns>A nullable double representing the coordinate, or null if parsing fails.</returns>
    private static double? ParseCoordinate(string? value) =>
        double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var coordinate)
            ? coordinate
            : null;

    private static AudienceModel ToAudienceModel(this EventAudienceRequestDto dto) => new()
    {
        Name = dto.Name?.Trim(),
        AudienceType = dto.AudienceType?.Trim()
    };
}
