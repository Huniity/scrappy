

using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Scrappy.Integrations.WhatsApp;

namespace Scrappy.Controllers.Webhooks;

/// <summary>
/// Controller for handling WhatsApp webhook requests, including verification and signature validation.
/// </summary>
[ApiController]
[Route("webhooks/whatsapp")]
public sealed class WhatsAppWebhookController(
    IOptions<WhatsAppOptions> options,
    WhatsAppWebhookSignatureValidator signatureValidator,
    ILogger<WhatsAppWebhookController> logger
) : ControllerBase
{
    private readonly WhatsAppOptions _options = options.Value;

    /// <summary>
    /// Verifies the webhook subscription request from WhatsApp.
    /// </summary>
    [HttpGet]
    [Produces("text/plain")]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? verifyToken,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        var validRequest = string.Equals(mode, "subscribe", StringComparison.OrdinalIgnoreCase) &&
                            !string.IsNullOrEmpty(_options.VerifyToken) &&
                           string.Equals(verifyToken, _options.VerifyToken, StringComparison.Ordinal);
    
        if (!validRequest)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Invalid verification token");
        }

        if (string.IsNullOrEmpty(challenge))
        {
            return BadRequest("Missing challenge parameter");
        }

        return Content(challenge, "text/plain", Encoding.UTF8);
    }


    /// <summary>
    /// Receives and validates incoming WhatsApp webhook requests, ensuring the signature is valid.
    /// </summary>
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Receive(
        CancellationToken cancellationToken)
    {
        await using var buffer = new MemoryStream();

        await Request.Body.CopyToAsync(
            buffer,
            cancellationToken);

        var payload = buffer.ToArray();

        if (payload.Length == 0)
        {
            return BadRequest();
        }

        var signature =
            Request.Headers["X-Hub-Signature-256"].ToString();

        if (!signatureValidator.IsValid(payload, signature))
        {
            logger.LogWarning(
                "Rejected WhatsApp webhook with an invalid signature.");

            return Unauthorized();
        }

        logger.LogInformation(
            "Received signed WhatsApp webhook containing {PayloadLength} bytes.", payload.Length);

        return Ok();
    }
}
    