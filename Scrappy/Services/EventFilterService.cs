

using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.DTOs;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using System.Text.RegularExpressions;

namespace Scrappy.Services;

public class EventFilterService
{
    public FilterDefinition<DistrictEvent> BuildFilter(
        DistrictName? district,
        LocalityName? locality,
        Nuts2Region? region,
        bool? hasCoords,
        EventStatus? status,
        EventAttendanceMode? attendanceMode,
        bool? isAccessibleForFree,
        EventType? type,
        DateTime? startDate,
        DateTime? endDate,
        decimal? minQualityScore,
        string? searchTerm,
        bool? isPublished
        )
    {
        var builder = Builders<DistrictEvent>.Filter;
        var filters = new List<FilterDefinition<DistrictEvent>>();

        if (district.HasValue)
            filters.Add(builder.Eq(e => e.District, district.Value));

        if (region.HasValue)
            filters.Add(builder.Eq(e => e.Event.Location!.Region, region.Value));

        if (locality.HasValue)
            filters.Add(builder.Eq(e => e.Event.Location!.Locality, locality.Value));
        if (status.HasValue)
            filters.Add(builder.Eq(e => e.Event.Status, status.Value));

        if (attendanceMode.HasValue)
            filters.Add(builder.Eq(e => e.Event.AttendanceMode, attendanceMode.Value));

        if (isAccessibleForFree.HasValue)
            filters.Add(builder.Eq(e => e.Event.IsAccessibleForFree, isAccessibleForFree.Value));

        if (type.HasValue)
            filters.Add(builder.Eq(e => e.Event.Type, type.Value));

        if (startDate.HasValue)
            filters.Add(builder.Gte(e => e.Event.StartDate, startDate.Value));

        if (endDate.HasValue)
            filters.Add(builder.Lte(e => e.Event.StartDate, endDate.Value));

        if (minQualityScore.HasValue)
            filters.Add(builder.Gte(e => e.Event.QualityScore, minQualityScore.Value));

        if (hasCoords.HasValue)
        {
            var latitudeExists = builder.And(builder.Exists(e => e.Event.Location!.Latitude, true), builder.Ne(e => e.Event.Location!.Latitude, null));
            var longitudeExists = builder.And(builder.Exists(e => e.Event.Location!.Longitude, true), builder.Ne(e => e.Event.Location!.Longitude, null));
            if (hasCoords.Value)
            {
                filters.Add(builder.And(longitudeExists, latitudeExists));
            }
            else
            {
                filters.Add(builder.Or(builder.Not(longitudeExists), builder.Not(latitudeExists)));
            }
        }

        if (isPublished.HasValue)
            filters.Add(builder.Eq(e => e.Event.IsPublished, isPublished.Value));

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var pattern = Regex.Escape(searchTerm.Trim());
            var regex = new BsonRegularExpression(pattern, "i");

            var searchFilter = builder.Or
                (
                    builder.Regex(e => e.Event.Title, regex),
                    builder.Regex(e => e.Event.Description, regex),
                    builder.Regex(e => e.Event.Location!.Name, regex)
                );

            filters.Add(searchFilter);
        }

        return filters.Count > 0 ? builder.And(filters) : builder.Empty;
    }
}
