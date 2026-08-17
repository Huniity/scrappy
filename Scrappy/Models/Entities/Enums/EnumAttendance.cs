

using System.ComponentModel.DataAnnotations;
using Scrappy.Models;

namespace Scrappy.Models.Entities.Enums;

/// <summary>
/// Event attendance Modes.
/// </summary>
public enum EventAttendanceMode
{
    /// <summary> In-Person Attendance Mode </summary>
    [Display(Name = "Presencial")]
    InPerson,
    /// <summary> Online Attendance Mode </summary>
    [Display(Name = "Online")]
    Online,
    /// <summary> Hybrid Attendance Mode </summary>
    [Display(Name = "Híbrido")]
    Hybrid
}