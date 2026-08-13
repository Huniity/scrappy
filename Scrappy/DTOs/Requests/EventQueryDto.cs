

using Scrappy.Models;
using Scrappy.Models.Entities;

namespace Scrappy.DTOs.Requests;

/// <summary>
/// Represents the parameters for querying events, including pagination, filtering, and sorting options.
///
/// Example:
/// {
///   "pageSize": 20,
///   "page": 1,
///   "minQualityScore": 0.5,
///   "district": "Faro",
///   "type": "Conference",
///   "searchTerm": "Sample Event",
///   "startDate": "2024-06-01",
///   "endDate": "2024-06-30",
///   "sortBy": "date_desc"
/// }
/// </summary>
public class EventQueryParameters
{
    /// <summary> Gets or sets the page size for pagination. </summary>
    private int _pageSize = 20;

    /// <summary> Gets or sets the page number for pagination. </summary>
    private int _page = 1;

    /// <summary> Gets or sets the page size for pagination, clamped between 1 and 100. </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, 100);
    }

    /// <summary> Gets or sets the page number for pagination, ensuring it is at least 1. </summary>
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    /// <summary> Gets or sets the minimum quality score for filtering events. </summary>
    public decimal? MinQualityScore { get; set; }

    /// <summary> Gets or sets the district for filtering events. </summary>
    public DistrictName? District { get; set; }

    /// <summary> Gets or sets the locality for filtering events. </summary>
    public LocalityName? Locality { get; set; }

    /// <summary> Gets or sets the NUTS2 region for filtering events. </summary>
    public Nuts2Region? Region { get; set; }

    /// <summary> Gets or sets the type for filtering events. </summary>
    public EventType? Type { get; set; }

    /// <summary> Gets or sets the status for filtering events. </summary>
    public EventStatus? Status { get; set; }


    public EventAttendanceMode? AttendanceMode { get; set; }

    /// <summary> Gets or sets the search term for filtering events by title or description. </summary>
    public string? SearchTerm { get; set; }

    /// <summary> Gets or sets the start date for filtering events. </summary>
    public DateTime? StartDate { get; set; }

    /// <summary> Gets or sets the end date for filtering events. </summary>
    public DateTime? EndDate { get; set; }

    /// <summary> Gets or sets the sorting option for events. </summary>
    public string? SortBy { get; set; } = "date_desc";
}
