

using System.Globalization;
using Scrappy.DTOs.Requests;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;


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
            Description = dto.Description,
            AlternateName = dto.AlternateName ?? string.Empty,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
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
            Organizer = dto.Organizer?.ToAgentModel(),
            Promoter = dto.Promoter?.ToAgentModel(),
            Performers = dto.Performers.Select(ToAgentModel).ToList(),
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
        if (dto.Organizer is not null) eventModel.Organizer = dto.Organizer.ToAgentModel();
        if (dto.Promoter is not null) eventModel.Promoter = dto.Promoter.ToAgentModel();
        if (dto.Performers is not null) eventModel.Performers = dto.Performers.Select(ToAgentModel).ToList();
        if (dto.Schedule is not null) eventModel.Schedule = dto.Schedule.ToScheduleModel();
    }

    // <summary> Maps a <see cref="EventLocationRequestDto"/> to an <see cref="EventLocation"/> model. </summary>
    /// <param name="dto">The <see cref="EventLocationRequestDto"/> to map.</param>
    /// <returns>A new <see cref="EventLocation"/> model with properties mapped from the provided DTO.</returns>
    public static EventLocation ToEventLocation(this EventLocationRequestDto dto) => new()
    {
        Name = dto.Name,
        Locality = dto.Locality
            ?? throw new ArgumentException("Location locality is required.", nameof(dto)),
        District = dto.District
            ?? throw new ArgumentException("Location district is required.", nameof(dto)),
        Region = dto.Region
            ?? throw new ArgumentException("Location region is required.", nameof(dto)),
        Country = dto.Country,
        DicoCode = dto.DicoCode,
        Latitude = ParseCoordinate(dto.Latitude),
        Longitude = ParseCoordinate(dto.Longitude)
    };

    // <summary> Maps a <see cref="EventAgentRequestDto"/> to an <see cref="AgentModel"/>. </summary>
    /// <param name="dto">The <see cref="EventAgentRequestDto"/> to map.</param>
    /// <returns>A new <see cref="AgentModel"/> with properties mapped from the provided DTO.</returns>
    public static AgentModel ToAgentModel(this EventAgentRequestDto dto) => new()
    {
        Name = dto.Name,
        Type = dto.Type,
        Url = dto.Url,
        SameAs = dto.SameAs
    };

    // <summary> Maps a <see cref="EventScheduleRequestDto"/> to a <see cref="ScheduleModel"/>. </summary>
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

    // <summary> Parses a string representation of a coordinate into a nullable double. </summary>
    /// <param name="value">The string representation of the coordinate.</param>
    /// <returns>A nullable double representing the coordinate, or null if parsing fails.</returns>
    private static double? ParseCoordinate(string? value) =>
        double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var coordinate)
            ? coordinate
            : null;
}
