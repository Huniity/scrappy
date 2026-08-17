

using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.DTOs;
using Scrappy.Common;
using Scrappy.Validators;
using MongoDB.Driver;
using MongoDB.Bson;

namespace Scrappy.Services;

public class EventSortingService
{
    public SortDefinition<DistrictEvent> GetSortParams(string? sortBy)
    {
        var sort = Builders<DistrictEvent>.Sort;

        return sortBy?.Trim().ToLowerInvariant() switch
        {
            "date_asc" => sort.Ascending(e => e.Event.StartDate),
            "date_desc" => sort.Descending(e => e.Event.StartDate),
            "quality_asc" => sort.Ascending(e => e.Event.QualityScore),
            "quality_desc" => sort.Descending(e => e.Event.QualityScore),
            "title_asc" => sort.Ascending(e => e.Event.Title),
            "title_desc" => sort.Descending(e => e.Event.Title),
            "location_asc" => sort.Ascending(e => e.Event.Location!.Name),
            "location_desc" => sort.Descending(e => e.Event.Location!.Name),
            "type_asc" => sort.Ascending(e => e.Event.Type),
            "type_desc" => sort.Descending(e => e.Event.Type),
            // "price_asc" => sort.Ascending(e => e.Event.Price),
            // "price_desc" => sort.Descending(e => e.Event.Price),
            // "is_free_asc" => sort.Ascending(e => e.IsFree),
            // "is_free_desc" => sort.Descending(e => e.IsFree),
            _ => sort.Descending(e => e.Event.StartDate)
        };
    }
}
