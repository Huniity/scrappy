

using Microsoft.AspNetCore.Mvc;
using Scrappy.Services;

namespace Scrappy.Controllers;

/// <summary>
/// Redirects canonical municipality slugs to their official websites.
/// </summary>
[ApiController]
[Route("municipio")]
[Route("municipios")]
public sealed class MunicipalityRedirectController(
    MunicipalityCatalog municipalityCatalog)
    : ControllerBase
{
    /// <summary>
    /// Redirects a canonical municipality slug to its official website.
    /// </summary>
    [HttpGet("{localitySlug}")]

    [ProducesResponseType(StatusCodes.Status302Found)]

    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult RedirectToWebsite(string localitySlug)
    {
        try
        {
            var municipality = municipalityCatalog.GetRequired(localitySlug);

            return
            Redirect(municipality.WebsiteUrl);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
