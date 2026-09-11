

using System.Globalization;
using System.Text;
using Scrappy.Extensions;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Integrations.WhatsApp;

public static class LocalitySlug
{
    public static string From(LocalityName locality)
    {
        var name = locality.GetDisplayName();
        var decomposed = name.Normalize(NormalizationForm.FormD);
        var slug = new StringBuilder();
        var separatorPending = false;

        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) ==
                UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(character))
            {
                if (separatorPending && slug.Length > 0)
                {
                    slug.Append('-');
                }

                slug.Append(char.ToLowerInvariant(character));
                separatorPending = false;
            }
            else if (slug.Length > 0)
            {
                separatorPending = true;
            }
        }

        return slug.ToString();
    }
}