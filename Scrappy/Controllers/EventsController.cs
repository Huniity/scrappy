

using Microsoft.AspNetCore.Mvc;
using Scrappy.DTOs;
using Scrappy.Services;
using Scrappy.Exceptions;

namespace Scrappy.Controllers;

[ApiController]
[Route("events")]
public class EventsController(EventService eventService) : ControllerBase
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
            return StatusCode(500, new { error = "An internal error has occurred: " + ex.Message });
        }
    }

    [HttpPatch("{id:length(24)}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateEventDto dto)
    {
        try
        {
            dto.Id = id;
            var result = await eventService.UpdateEvent(dto);
            
            if (!result.IsSuccess)
            {
                return NotFound(new { error = result.Error });
            }
            return Ok(result.Value);
        }
        catch (ValidationException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An internal error has occurred: " + ex.Message });
        }
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await eventService.DeleteEvent(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.Error });
        }
        return Ok(result.Value);
    }
}