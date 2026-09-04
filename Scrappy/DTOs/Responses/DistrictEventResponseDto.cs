namespace Scrappy.DTOs.Responses;

/// <summary>
/// Represents an event together with the district association used by the
/// event search and management endpoints.
/// </summary>
public sealed class DistrictEventResponseDto
{
    /// <summary> Gets or sets the identifier of the district-event record. </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary> Gets or sets the district associated with the event. </summary>
    public string District { get; set; } = string.Empty;

    /// <summary> Gets or sets the event response. </summary>
    public EventResponseDto Event { get; set; } = new();
}
