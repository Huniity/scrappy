

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
    public DistrictName District { get; set; }

    [BsonElement("Event")]
    public Event Event { get; set; } = new();
}


/// <summary>
/// Administrative districts of Portugal.
/// </summary>
public enum DistrictName
{
    /// <summary>District of Aveiro</summary>
    Aveiro,
    /// <summary>District of Beja</summary>
    Beja,
    /// <summary>District of Braga</summary>
    Braga,
    /// <summary>District of Bragança</summary>
    Bragança,
    /// <summary>District of Castelo Branco</summary>
    [Display(Name = "Castelo Branco")]
    CasteloBranco,
    /// <summary>District of Coimbra</summary>
    Coimbra,
    /// <summary>District of Évora</summary>
    Évora,
    /// <summary>District of Faro</summary>
    Faro,
    /// <summary>District of Guarda</summary>
    Guarda,
    /// <summary>District of Leiria</summary>
    Leiria,
    /// <summary>District of Lisboa</summary>
    Lisboa,
    /// <summary>District of Portalegre</summary>
    Portalegre,
    /// <summary>District of Porto</summary>
    Porto,
    /// <summary>District of Santarém</summary>
    Santarém,
    /// <summary>District of Setúbal</summary>
    Setúbal,
    /// <summary>District of Viana do Castelo</summary>
    [Display(Name = "Viana do Castelo")]
    VianaDoCastelo,
    /// <summary>District of Vila Real</summary>
    [Display(Name = "Vila Real")]
    VilaReal,
    /// <summary>District of Viseu</summary>
    Viseu
}