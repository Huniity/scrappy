

using Microsoft.AspNetCore.Mvc;
using Scrappy.DTOs;
using Scrappy.Models;
using Scrappy.Services;

namespace Scrappy.Controllers;

[ApiController]
[Route("events")]
[Produces("application/json")]
public class EventsSortingController(EventQueryService queryService) : ControllerBase
{
    [HttpGet("sort")]
    public async Task<IActionResult> GetSortedEvents(
        [FromQuery] string? sortBy = "date_asc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var queryParams = new EventQueryParameters
        {
            SortBy = sortBy,
            Page = page,
            PageSize = pageSize
        };

        var result = await queryService.QueryAsync(queryParams);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return Ok(result.Value);
    }
}