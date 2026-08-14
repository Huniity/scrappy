

using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;

namespace Scrappy.Services.Interfaces;

public interface IGeoDataService
{
    (DistrictName? District, Nuts2Region Region, string DicoCode)? Lookup(
        LocalityName locality);
}
