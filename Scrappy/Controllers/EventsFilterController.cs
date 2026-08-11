

using Microsoft.AspNetCore.Mvc;
using Scrappy.Services;
using Scrappy.DTOs;
using Scrappy.Exceptions;

namespace Scrappy.Controllers;

[ApiController]
[Route("events")]
public class EventsFilterController(EventQueryService queryService) : ControllerBase
{
    [HttpGet("search")]
    public async Task<IActionResult> SearchEvents([FromQuery] EventQueryParameters query)
    {
        var result = await queryService.QueryAsync(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }
}
