

namespace Scrappy.DTOs.Common;

/// <summary>
/// Represents a paginated result set, including the items, total count, current page, page size, and pagination metadata. This class is used to standardize the response format for API endpoints that return paginated data.
/// </summary>
/// <typeparam name="T"></typeparam>
public class PagedResult<T>
{
    /// <summary> Gets or sets the collection of items in the current page. </summary>
    public IEnumerable<T> Items { get; set; } = [];

    /// <summary> Gets or sets the total number of items across all pages. </summary>
    public long TotalCount { get; set; }

    /// <summary> Gets or sets the current page number. </summary>
    public int Page { get; set; }

    /// <summary> Gets or sets the number of items per page. </summary>
    public int PageSize { get; set; }

    /// <summary> Gets the total number of pages based on the total count and page size. </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    /// <summary> Gets a value indicating whether there is a next page available. </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary> Gets a value indicating whether there is a previous page available. </summary>
    public bool HasPreviousPage => Page > 1;
}