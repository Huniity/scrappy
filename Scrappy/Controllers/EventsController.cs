

using Microsoft.AspNetCore.Mvc;
using Scrappy.DTOs.Common;
using Scrappy.DTOs.Requests;
using Scrappy.DTOs.Responses;
using Scrappy.DTOs.SchemaOrg;
using Scrappy.Mappers;
using Scrappy.Services;
using Scrappy.Exceptions;
using MongoDB.Bson;

namespace Scrappy.Controllers;


/// <summary>
/// Controller for managing events, providing endpoints for creating, retrieving, updating, and deleting events.
///
/// </summary>
[ApiController]
[Route("events")]
public class EventsController(
    EventService eventService,
    ILogger<EventsController> logger) : ControllerBase
{
    /// <summary> Retrieves the Schema.org representation of an event by its ID. </summary>
    /// <param name="id">The ID of the event to retrieve.</param>
    /// <returns>A JSON-LD representation of the event in Schema.org format, or an error response if the event is not found or the ID is invalid.</returns>
    [HttpGet("{id:length(24)}/schema-org")]
    [Produces("application/ld+json")]
    public async Task<IActionResult> GetSchemaOrgById(string id)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest(new { error = "Invalid event id." });

        var result = await eventService.GetEventById(id);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
        var schema =result.Value!.ToSchemaOrgDto(baseUrl);

        return new JsonResult(schema)
        {
            ContentType = "application/ld+json"
        };
    }

    /// <summary> Retrieves all events. </summary>
    /// <returns>A list of all events.</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await eventService.GetAllEvents();
        if (!result.IsSuccess)
        {
            return StatusCode(500, new { error = result.Error });
        }
        return Ok(result.Value!.Select(eventEntity => eventEntity.ToSummaryDto()));
    }

    /// <summary> Retrieves an event by its ID. </summary>
    /// <param name="id">The ID of the event to retrieve.</param>
    /// <returns>The event with the specified ID, or a 404 Not Found if the event is not found or the ID is invalid.</returns>
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
        return Ok(result.Value!.ToDistrictEventResponseDto());
    }

    /// <summary> Creates a new event. </summary>
    /// <param name="dto">The data transfer object containing the event details.</param>
    /// <returns>The created event, or an error response if the creation fails.</returns>
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

            Response.Headers["X-Ingestion-Action"] = eventService.LastIngestionAction;
            if (eventService.LastUpdatedFields.Count > 0)
                Response.Headers["X-Ingestion-Updated-Fields"] =
                    string.Join(',', eventService.LastUpdatedFields);

            var eventEntity = result.Value!;
            var response = eventEntity.ToDistrictEventResponseDto();

            return eventService.LastIngestionAction == "created"
                ? CreatedAtAction(nameof(GetById), new { id = eventEntity.Id }, response)
                : Ok(response);
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

    /// <summary> Updates an existing event by its ID. </summary>
    /// <param name="id">The ID of the event to update.</param>
    /// <param name="dto">The data transfer object containing the updated event details.</param>
    /// <returns>The updated event, or an error response if the update fails.</returns>
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
            return Ok(result.Value!.ToDistrictEventResponseDto());
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

    /// <summary> Deletes an event by its ID. </summary>
    /// <param name="id">The ID of the event to delete.</param>
    /// <returns>A success response if the deletion is successful, or an error response if it fails.</returns>
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
        return Ok(result.Value!.ToDistrictEventResponseDto());
    }

}
