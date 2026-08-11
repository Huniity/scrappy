using MongoDB.Driver;
using Scrappy.Common;
using Scrappy.DTOs;
using Scrappy.Models;

namespace Scrappy.Services;

public class EventQueryService(
    IMongoDatabase database, 
    EventFilterService filterService, 
    EventSortingService sortingService)
{
    private readonly IMongoCollection<DistrictEvent> _events = database.GetCollection<DistrictEvent>("DistrictEvents");

    public async Task<Result<PagedResult<DistrictEvent>>> QueryAsync(EventQueryParameters query)
    {
        try
        {
            var filter = filterService.BuildFilter(query.District, query.Type, query.StartDate, query.EndDate, query.SearchTerm);
            var sort = sortingService.GetSortParams(query.SortBy);

            var totalCount = await _events.CountDocumentsAsync(filter);

            var items = await _events.Find(filter)
                                     .Sort(sort)
                                     .Skip((query.Page - 1) * query.PageSize)
                                     .Limit(query.PageSize)
                                     .ToListAsync();

            var pagedResult = new PagedResult<DistrictEvent>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return Result<PagedResult<DistrictEvent>>.Success(pagedResult);
        }
        catch (Exception ex)
        {
            return Result<PagedResult<DistrictEvent>>.Failure($"Query execution failed: {ex.Message}");
        }
    }
}