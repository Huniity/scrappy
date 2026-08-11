

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;


namespace Scrappy.Models;


public class DistrictEvent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("DistrictName")]
    [BsonRepresentation(BsonType.String)]
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
[Display(Name = "Castelo Branco")]
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
[Display(Name = "Viana do Castelo")]
VianaDoCastelo,
[Display(Name = "Vila Real")]
VilaReal,
Viseu
}