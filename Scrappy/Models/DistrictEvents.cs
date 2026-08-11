

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace Scrappy.Models;


public class DistrictEvent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("DistrictName")]
    public DistrictName District {get; set; }

    [BsonElement("Event")]
    public Event Event {get; set; } = new();
}


public enum DistrictName
{
Aveiro,
Beja,
Braga,
Bragança,
CasteloBranco,
Coimbra,
Évora,
Faro,
Guarda,
Leiria,
Lisboa,
Portalegre,
Porto,
Santarém,
Setúbal,
VianaDoCastelo,
VilaReal,
Viseu
}