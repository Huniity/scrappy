  
  
  using Microsoft.AspNetCore.Mvc;
  using Scrappy.DTOs.Requests;
  using Scrappy.Services;

  namespace Scrappy.Controllers;

  [ApiController]
  [Route("public/events")]
  [Produces("application/json")]
  public class PublicEventsController(
      EventQueryService queryService,
      ILogger<PublicEventsController> logger
  ) : ControllerBase
  {
      [HttpGet]
      public async Task<IActionResult> Search(
          [FromQuery] EventQueryParameters query
      )
      {
          try
          {
              // A agenda pública nunca pode devolver eventos não publicados.
              query.IsPublished = true;

              var result = await queryService.QueryAsync(query);

              if (!result.IsSuccess)
              {
                  return BadRequest(new {
                      error = result.Error
                  });
              }

              return Ok(result.Value);
          }
          catch (Exception exception)
          {
              logger.LogError(
                  exception,
                  "Failed to query public events"
              );

              return StatusCode(500, new {
                  error = "An internal server error occurred."
              });
          }
      }
  }