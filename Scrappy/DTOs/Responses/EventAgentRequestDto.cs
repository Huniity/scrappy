

namespace Scrappy.DTOs.Responses;

/// <summary>
/// Represents a response DTO for event agent information, including properties such as name, type, URL, and sameAs.
/// 
/// Example:
/// {
///   "name": "Sample Event Agent",
///   "type": "Organization",
///   "url": "https://www.example.com/agent",
///   "sameAs": "https://www.example.com/agent-profile"
/// }
/// </summary>
public class EventAgentResponseDto
{
    /// <summary> Gets or sets the name of the event agent. </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the type of the event agent. </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary> Gets or sets the URL of the event agent. </summary>
    public string? Url { get; set; }

    /// <summary> Gets or sets the sameAs URL of the event agent. </summary>
    public string? SameAs { get; set; }
}