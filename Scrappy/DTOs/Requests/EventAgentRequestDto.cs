

using System.ComponentModel.DataAnnotations;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.DTOs.Requests;


/// <summary>
/// Represents a request DTO for creating or updating an event agent, including properties such as name, email, phone, and website.
/// 
/// Example:
/// {
///  "name": "Event Agent Name",
///  "type": "Organization",
///  "url": "https://www.example.com",
///  "sameAs": "https://www.example.com/agent"
/// }
/// </summary>
public class EventAgentRequestDto
{
    /// <summary> Gets or sets the name of the event agent. </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the type of the event agent, which can be "Person", "Organization", or other types. </summary>
    public AgentType? Type { get; set; } = AgentType.Organization;

    /// <summary> Gets or sets the URL of the event agent. </summary>
    public string? Url { get; set; }

    /// <summary> Gets or sets the "sameAs" URL of the event agent, which is used to indicate that the agent is the same as another entity. </summary>
    public string? SameAs { get; set; }
}