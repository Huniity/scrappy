


using Scrappy.Models;
using Scrappy.Models.Entities;
using System.Text.Json.Serialization;

namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents an agent in the Schema.org format. This class is used to define various types of agents, such as persons, organizations, and other types, along with their associated properties.
/// 
/// Example:
/// {
///   "@type": "Person",
///   "name": "John Doe",
///   "url": "https://www.example.com/johndoe1",
///   "sameAs": "https://www.example.com/johndoe2"
/// }
/// </summary>
public class SchemaOrgAgentDto
{
    /// <summary> Gets or sets the type of the agent, which can be "Person", "Organization", or other types. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "Organization";

    /// <summary> Gets or sets the name of the agent. </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the URL of the agent. </summary>
    [JsonPropertyName("url")]
    public string? Url { get; set; } 

    
    [JsonPropertyName("sameAs")]
    public string? SameAs { get; set; }
}