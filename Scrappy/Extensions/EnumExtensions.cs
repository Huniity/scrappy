using Scrappy.DTOs.Common;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Scrappy.Extensions;

public static class EnumExtensions
{
    public static string GetDisplayName(this Enum value)
    {
        var member = value.GetType().GetMember(value.ToString()).FirstOrDefault();

        return member?.GetCustomAttribute<DisplayAttribute>()?.Name
            ?? value.ToString();
    }

    public static CodeNameDto ToCodeName(this Enum value) =>
        new(value.ToString(), value.GetDisplayName());
}
