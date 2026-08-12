

using Scrappy.Models;
using Scrappy.Models.Entities;

namespace Scrappy.DTOs;

public class UpdateEventDto
{
    public string? Title { get; set; }
    public DistrictName? District { get; set; }
    public string? Description { get; set; }
    public string? StartDate { get; set; } 
    public string? EndDate { get; set; }
    public string? Location { get; set; }
    public string? SourceUrl { get; set; }
    public EventType? Type { get; set; }
}
