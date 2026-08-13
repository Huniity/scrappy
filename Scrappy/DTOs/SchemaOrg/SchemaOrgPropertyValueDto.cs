


using Scrappy.Models;
using Scrappy.Models.Entities;
using System.Text.Json.Serialization;

namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents a property value in the Schema.org format. This class is used to define various properties of an entity, such as name, description, and other relevant information.
/// 
/// Example:
/// {
///   "@type": "PropertyValue",
///   "name": "Quality Score",
///   "value": "85"
/// }
/// </summary>
public class SchemaOrgPropertyValueDto
{
    /// <summary> Gets or sets the type of the property value, which is always "PropertyValue" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "PropertyValue";

    /// <summary> Gets or sets the name of the property. </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the value of the property. </summary>
    [JsonPropertyName("value")]
    public string Value { get; set; } = null!;
}