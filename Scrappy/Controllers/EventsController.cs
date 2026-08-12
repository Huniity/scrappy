

using Microsoft.AspNetCore.Mvc;
using Scrappy.DTOs.Common;
using Scrappy.DTOs.Requests;
using Scrappy.Services;
using Scrappy.Exceptions;
using MongoDB.Bson;

namespace Scrappy.Controllers;

[ApiController]
[Route("events")]
public class EventsController(
    EventService eventService,
    ILogger<EventsController> logger) : ControllerBase
{

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await eventService.GetAllEvents();
        if (!result.IsSuccess)
        {
            return StatusCode(500, new { error = result.Error });
        }
        return Ok(result.Value);
    }

    [HttpGet("{id:length(24)}")]
    public async Task<IActionResult> GetById(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest(new { error = "Invalid event id." });

        var result = await eventService.GetEventById(id);
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.Error });
        }
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventDto dto)
    {
        try
        {
            var result = await eventService.AddEvent(dto);
            
            if (!result.IsSuccess)
            {
                return BadRequest(new { error = result.Error });
            }
            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
        }
        catch (ValidationException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create event");
            return StatusCode(500, new { error = "An internal server error occurred." });
        }
    }

    [HttpPatch("{id:length(24)}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateEventDto dto)
    {
        try
        {
            if (!ObjectId.TryParse(id, out _))
                return BadRequest(new { error = "Invalid event id." });

            var result = await eventService.UpdateEvent(id, dto);
            
            if (!result.IsSuccess)
            {
                return result.Error == "Event not found"
                    ? NotFound(new { error = result.Error })
                    : BadRequest(new { error = result.Error });
            }
            return Ok(result.Value);
        }
        catch (ValidationException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update event {EventId}", id);
            return StatusCode(500, new { error = "An internal server error occurred." });
        }
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest(new { error = "Invalid event id." });

        var result = await eventService.DeleteEvent(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.Error });
        }
        return Ok(result.Value);
    }
}
