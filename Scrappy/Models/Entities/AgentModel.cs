

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Models.Entities;

/// <summary>
/// Represents an agent associated with an event, such as an organizer, promoter, or performer.
/// </summary>
public class AgentModel
{
    /// <summary> Gets or sets the name of the agent. </summary>
    [BsonElement("Name")]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the type of the agent. </summary>
    [BsonElement("Type")]
    [BsonRepresentation(BsonType.String)]
    public AgentType? Type { get; set; }

    /// <summary> Gets or sets the URL associated with the agent. </summary>
    [BsonElement("Url")]
    public string? Url { get; set; }

    /// <summary> Gets or sets an alternative URL identifying the same agent. </summary>
    [BsonElement("SameAs")]
    public string? SameAs { get; set; }
}
