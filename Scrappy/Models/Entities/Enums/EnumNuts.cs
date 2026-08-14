

using System.ComponentModel.DataAnnotations;
using Scrappy.Models;

namespace Scrappy.Models.Entities.Enums;

/// <summary>
/// Administrative region divisions of Portugal that follows NUTS2.
/// </summary>
public enum Nuts2Region
{
    /// <summary>Norte Region</summary>
    [Display(Name = "Norte")]
    PT11,
    /// <summary>Centro Region</summary>
    [Display(Name = "Centro")]
    PT16,
    /// <summary>Grande Lisboa Region</summary>
    [Display(Name = "Grande Lisboa")]
    PT1A,
    /// <summary>Península Setúbal Region</summary>
    [Display(Name = "Península de Setúbal")]
    PT1B,
    /// <summary>Oeste e Vale do Tejo</summary>
    [Display(Name = "Oeste e Vale do Tejo")]
    PT1C,
    /// <summary>Alentejo Region</summary>
    [Display(Name = "Alentejo")]
    PT18,
    /// <summary>Algarve Region</summary>
    [Display(Name = "Algarve")]
    PT15,
    /// <summary>Região Autónoma dos Açores Region</summary>
    [Display(Name = "Região Autónoma dos Açores")]
    PT20,
    /// <summary>Região Autónoma da Madeira Region</summary>
    [Display(Name = "Região Autónoma da Madeira")]
    PT30
}