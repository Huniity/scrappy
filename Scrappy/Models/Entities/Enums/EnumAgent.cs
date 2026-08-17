

using System.ComponentModel.DataAnnotations;
using Scrappy.Models;

namespace Scrappy.Models.Entities.Enums;

/// <summary>
/// Event entities types.
/// </summary>
public enum AgentType
{
    /// <sumarry> Person Type </sumarry>
    [Display(Name = "Pessoa")]
    Person,
    /// <sumarry> Organization Type </sumarry>
    [Display(Name = "Organização")]
    Organization,
    /// <sumarry> Gov Type </sumarry>
    [Display(Name = "Governo")]
    Gov,
    /// <sumarry> Company Type </sumarry>
    [Display(Name = "Empresa")]
    Company,
    /// <sumarry> MusicGroup Type </sumarry>
    [Display(Name = "Grupo Musical")]
    MusicGroup,
    /// <sumarry> Performing Group Type </sumarry>
    [Display(Name = "Grupo de Performance")]
    PerformingGroup,
    /// <sumarry> Other Type </sumarry>
    [Display(Name = "Outro")]
    Other
}