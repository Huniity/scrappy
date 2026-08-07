using Microsoft.AspNetCore.Mvc;
using Scrappy.DTOs;
using Scrappy.Models;
using Scrappy.Services;
using Scrappy.Exceptions;
using Scrappy.Common;

namespace Scrappy.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController(EventService eventService) : ControllerBase
{

    [HttpGet]
    public IActionResult GetAll()
    {
        var result = eventService.GetAllEvents();
        if (!result.IsSuccess)
        {
            return StatusCode(500, new { error = result.Error});
        }
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        var result = eventService.GetEventById(id);
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.Error });
        }
        return Ok(result.Value);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateEventDto dto)
    {
        try
        {
            var result = eventService.AddEvent(dto);
            
            if(!result.IsSuccess)
            {
                return BadRequest(new { error = result.Error });
            }
            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id}, result.Value);
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

    [HttpPatch("{id:guid}")]
    public IActionResult Update(Guid id, [FromBody] UpdateEventDto dto)
    {
        try
        {
            dto.Id = id;
            var result = eventService.UpdateEvent(dto);
            
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

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
    {
        var result = eventService.DeleteEvent(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.Error });
        }
        return Ok(result.Value);
    }
}