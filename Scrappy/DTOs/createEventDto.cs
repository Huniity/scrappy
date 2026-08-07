

namespace Scrappy.DTOs;

public class CreateEventDto
{
    public string District { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string? EndDate { get; set; }
    public string? Location { get; set; }
    public string SourceUrl { get; set; } = string.Empty;
    public string? Type { get; set; }
    public decimal QualityScore { get; set; }
}