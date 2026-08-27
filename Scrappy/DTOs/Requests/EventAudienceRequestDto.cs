

using System.ComponentModel.DataAnnotations;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.DTOs.Requests;

public class EventAudienceRequestDto
{
    /// <summary> Gets or sets the name of the audience. </summary>
    public string? Name { get; set; }

    /// <summary> Gets or sets the type of the audience. </summary>
    public string? AudienceType { get; set; }
}