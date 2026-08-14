

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Models.Entities;

public class AgentModel
{
    [BsonElement("Name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("Type")]
    [BsonRepresentation(BsonType.String)]
    public AgentType? Type { get; set; }

    [BsonElement("Url")]
    public string? Url { get; set; }

    [BsonElement("SameAs")]
    public string? SameAs { get; set; }
}