

using Scrappy.Models;
namespace Scrappy.DTOs;

public class CreateEventDto
{
    public DistrictName? District { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string? EndDate { get; set; }
    public string? Location { get; set; }
    public string SourceUrl { get; set; } = string.Empty;
    public EventType? Type { get; set; }
}
