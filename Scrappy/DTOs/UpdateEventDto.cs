

namespace Scrappy.DTOs;

public class UpdateEventDto
{
    public string Id { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? District { get; set; }
    public string? Description { get; set; }
    public string? StartDate { get; set; } 
    public string? EndDate { get; set; }
    public string? Location { get; set; }
    public string? SourceUrl { get; set; }
    public string? Type { get; set; }
    public string? QualityScore { get; set; }
}
