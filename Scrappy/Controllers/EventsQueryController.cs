

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