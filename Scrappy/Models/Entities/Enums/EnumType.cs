

using System.ComponentModel.DataAnnotations;

namespace Scrappy.Models.Entities.Enums;


/// <summary>
/// Types of events.
/// </summary>
public enum EventType
{
    /// <summary>Event type Concerto</summary>
    Concerto,
    /// <summary>Event type Feira</summary>
    Feira,
    /// <summary>Event type Mercado</summary>
    Mercado,
    /// <summary>Event type Festa Popular</summary>
    [Display(Name = "Festa Popular")]
    FestaPopular,
    /// <summary>Event type Teatro</summary>
    Teatro,
    /// <summary>Event type Festival</summary>
    Festival,
    /// <summary>Event type Exposição</summary>
    Exposição,
    /// <summary>Event type Cinema</summary>
    Cinema,
    /// <summary>Event type Desporto</summary>
    Desporto,
    /// <summary>Event type Gastronomia</summary>
    Gastronomia,
    /// <summary>Event type Workshop</summary>
    Workshop,
    /// <summary>Event type Conferência</summary>
    Conferência,
    /// <summary>Event type Infantil</summary>
    Infantil,
    /// <summary>Event type Business</summary>
    Business,
    /// <summary>Event type Moda</summary>
    Moda, 
    /// <summary>Event type Educativo</summary>
    Educativo,
    /// <summary>Event type Património</summary>
    Património,
    /// <summary>Event type Social</summary>
    Social,
    /// <summary>Event type Cultural</summary>
    Cultural,
    /// <summary>Event type Hackaton</summary>
    Hackaton,
    /// <summary>Event type Outro</summary>
    Outro
}