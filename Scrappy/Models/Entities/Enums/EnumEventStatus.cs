

using System.ComponentModel.DataAnnotations;
using Scrappy.Models;

namespace Scrappy.Models.Entities.Enums;

/// <summary>
/// Event status types.
/// </summary>
public enum EventStatus
{
    /// <summary> Scheduled Type </summary>
    [Display( Name= "Programado")]
    Scheduled,
    /// <summary> Cancelled Type </summary>
    [Display( Name= "Cancelado")]
    Cancelled,
    /// <summary> Postponed Type </summary>    
    [Display( Name= "Adiado")]
    Postponed,
    /// <summary> Rescheduled Type </summary>
    [Display( Name= "Reprogramado")]
    Rescheduled,
    /// <summary> Completed Type </summary>
    [Display( Name= "Completado")]
    Completed,
    /// <summary> Moved Online Type </summary>
    [Display( Name= "Online")]
    MovedOnline,
}