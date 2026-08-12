

using System.ComponentModel.DataAnnotations;
using Scrappy.Models;

namespace Scrappy.Models.Entities;

/// <summary>
/// Event audience types.
/// </summary>
public enum AudienceType
{
    /// <summary> General Audience Type </summary>
    [Display(Name = "Geral")]
    General,
    /// <summary> Children and Family Audience Type </summary>
    [Display(Name = "Crianças e Família")]
    ChildrenAndFamily,
    /// <summary> Students and Youth Audience Type </summary>
    [Display(Name = "Estudantes e Jovens")]
    YouthAndStudents,
    /// <summary> Adult Audience Type </summary>
    [Display(Name = "Adultos")]
    Adult,
    /// <summary> Senior Audience Type </summary>
    [Display(Name = "Seniores")]
    Senior,
    /// <summary> Professional Audience Type </summary>
    [Display(Name = "Profissionais")]
    Professional,
}