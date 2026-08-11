

namespace Scrappy.DTOs;

using Scrappy.Models;

public class EventQueryParameters
{
    public DistrictName? District { get; set; }
    public EventType? Type { get; set; }
    public string? SearchTerm { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? MinQualityScore { get; set; }

    public string? SortBy { get; set; } = "date_desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}