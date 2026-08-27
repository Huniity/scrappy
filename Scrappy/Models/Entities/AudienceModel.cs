

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Models.Entities;

/// <summary>
/// Represents an audience associated with an event, such as a specific group of people or demographic.
/// </summary>
public class AudienceModel
{
    /// <summary> Gets or sets the name of the audience. </summary>
    [BsonElement("Name")]
    public string? Name { get; set; }

    /// <summary> Gets or sets the type of the audience. </summary>
    [BsonElement("AudienceType")]
    public string? AudienceType { get; set; }
}