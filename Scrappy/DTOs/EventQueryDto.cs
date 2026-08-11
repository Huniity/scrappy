

namespace Scrappy.DTOs;

using Scrappy.Models;

public class EventQueryParameters
{
    private int _pageSize = 20;
    private int _page = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, 100);
    }
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }
    public decimal? MinQualityScore { get; set; }

    public DistrictName? District { get; set; }
    public EventType? Type { get; set; }
    public string? SearchTerm { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }


    public string? SortBy { get; set; } = "date_desc";
}
