

using MongoDB.Driver;
using Scrappy.Common;
using Scrappy.DTOs.Common;
using Scrappy.DTOs.Requests;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Validators;

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

        if (!Validator.IsSearchTermValid(query.SearchTerm))
        {
            return Result<PagedResult<DistrictEvent>>.Failure(
                "SearchTerm must be at most 100 characters long.");
        }

        if (!Validator.IsPageSizeValid(query.PageSize))
        {
            return Result<PagedResult<DistrictEvent>>.Failure(
                "PageSize must be between 1 and 100.");
        }

        if (!Validator.IsPageValid(query.Page))
        {
            return Result<PagedResult<DistrictEvent>>.Failure(
                "Page must be at least 1.");
        }

        var sortBy = string.IsNullOrWhiteSpace(query.SortBy)
            ? "date_desc"
            : query.SortBy.Trim();

        if (!Validator.IsSortByValid(sortBy) ||
            !Validator.IsSortDirectionValid(sortBy))
        {
            return Result<PagedResult<DistrictEvent>>.Failure(
                "SortBy must be one of the supported fields with asc or desc direction.");
        }

        var filter = filterService.BuildFilter(
            query.District,
            query.Type,
            query.StartDate,
            query.EndDate,
            query.MinQualityScore,
            query.SearchTerm);
        var sort = sortingService.GetSortParams(sortBy);

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
}
