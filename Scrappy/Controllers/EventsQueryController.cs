

using Microsoft.AspNetCore.Mvc;
using Scrappy.DTOs;
using Scrappy.Models;
using Scrappy.Services;

namespace Scrappy.Controllers;

[ApiController]
[Route("events")]
[Produces("application/json")]
public class EventsQueryController(EventQueryService queryService) : ControllerBase
{
    /// <summary>
    /// Search, filter, sort, and paginate municipal events.
    /// </summary>
    /// <remarks>
    /// Sample request:
    /// 
    ///     GET /events/search?district=Faro&amp;type=Feira&amp;sortBy=quality_desc&amp;page=1&amp;pageSize=10
    /// 
    /// </remarks>
    /// <param name="query">Filter parameters including district, event type, date range, search terms, sorting, and pagination.</param>
    /// <returns>A paginated list of matching district events.</returns>
    /// <response code="200">Returns the paginated result set.</response>
    /// <response code="400">If the query parameters or date formats are invalid.</response>
    [HttpGet("search")]
    public async Task<IActionResult> SearchEvents([FromQuery] EventQueryParameters query)
    {
        var result = await queryService.QueryAsync(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return Ok(result.Value);
    }
}