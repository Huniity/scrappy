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
        if (query.StartDate.HasValue &&
            query.EndDate.HasValue &&
            query.StartDate.Value > query.EndDate.Value)
        {
            return Result<PagedResult<DistrictEvent>>.Failure(
                "StartDate cannot be later than EndDate.");
        }

        if (query.MinQualityScore is < 0 or > 100)
        {
            return Result<PagedResult<DistrictEvent>>.Failure(
                "MinQualityScore must be between 0 and 100.");
        }

        try
        {
            var filter = filterService.BuildFilter(query.District, query.Type, query.StartDate, query.EndDate, query.MinQualityScore, query.SearchTerm);
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
