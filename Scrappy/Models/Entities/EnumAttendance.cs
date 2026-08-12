

using System.ComponentModel.DataAnnotations;
using Scrappy.Models;

namespace Scrappy.Models.Entities;

/// <summary>
/// Event attendance types.
/// </summary>
public enum AttendanceType
{
    /// <summary> In-Person Attendance Type </summary>
    [Display(Name = "Presencial")]
    InPerson,
    /// <summary> Online Attendance Type </summary>
    [Display(Name = "Online")]
    Online,
    /// <summary> Hybrid Attendance Type </summary>
    [Display(Name = "Híbrido")]
    Hybrid
}