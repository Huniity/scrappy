


using System.Text.Json.Serialization;
using Scrappy.Models;
using Scrappy.Models.Entities;

namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents the audience information for an event in the Schema.org format. This class is used to define the target audience for an event, including general, children and family, students and youth, adult, senior, and professional audiences.
/// 
/// Example:
/// {
///   "@type": "Audience",
///  "audienceType": "General",
/// }
/// </summary>
public class SchemaOrgAudienceDto
{
    /// <summary> Gets or sets the type of the audience, which is always "Audience" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "Audience";

    /// <summary> Gets or sets the name of the audience, which can be used to provide a descriptive name for the audience. </summary>
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    /// <summary> Gets or sets the type of audience type (Adult, general, etc). </summary>
    [JsonPropertyName("audienceType")]
    public string AudienceType { get; set; } = string.Empty;
}