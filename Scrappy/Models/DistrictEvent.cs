

namespace Scrappy.Models;
public class DistrictEvent
{
    public Guid Id {get; set; } = Guid.NewGuid();
    public DistrictName District {get; set; }
    public Event Event {get; set; } = new();
}

public enum DistrictName
{
Aveiro,
Beja,
Braga,
Bragança,
CasteloBranco,
Coimbra,
Évora,
Faro,
Guarda,
Leiria,
Lisboa,
Portalegre,
Porto,
Santarém,
Setúbal,
VianaDoCastelo,
VilaReal,
Viseu
}