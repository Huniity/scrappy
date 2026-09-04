

using Microsoft.AspNetCore.Mvc;
using Scrappy.DTOs.Common;
using Scrappy.DTOs.Requests;
using Scrappy.Mappers;
using Scrappy.Models;
using Scrappy.Services;

namespace Scrappy.Controllers;

[ApiController]
[Route("events")]
[Produces("application/json")]
public class EventsQueryController(
    EventQueryService queryService,
    ILogger<EventsQueryController> logger) : ControllerBase
{
    [HttpGet("search")]
    public async Task<IActionResult> SearchEvents([FromQuery] EventQueryParameters query)
    {
        try
        {
            var result = await queryService.QueryAsync(query);

            if (!result.IsSuccess)
            {
                return BadRequest(new { error = result.Error });
            }

            return Ok(result.Value!.ToResponsePagedResult());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to query events");
            return StatusCode(500, new { error = "An internal server error occurred." });
        }
    }
}
