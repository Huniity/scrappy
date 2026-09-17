# Normalização

Os normalizadores convertem os dados específicos de cada fonte para o modelo
intermédio `NormalizedEvent`, antes de o router construir e validar `RawEvent`.

| Ficheiro | Responsabilidade |
| --- | --- |
| `bol.ts` | Datas BOL com/sem offset, sessões em português, preços, idade e atrações contínuas. |
| `viralAgenda.ts` | Limpeza de texto e conversão de evento, agentes, audiência, ofertas, agenda, estado e modo de participação Viral Agenda. |
| `dates.ts` | Validação de datas, cálculo de offset para um timezone, normalização Viral Agenda e filtro de eventos passados. |

Os normalizadores removem diferenças de forma sem inventar dados. Por exemplo,
uma propriedade Schema.org que seja objeto ou lista é convertida para uma forma
consistente, enquanto um campo impossível é omitido para que a validação final
possa decidir se o evento deve ser descartado.

As datas devem chegar à saída com offset. O filtro de eventos passados usa
`Europe/Lisbon` no fluxo atual, e `rawEventSchema` confirma que `endDate`, quando
presente, não fica antes de `startDate`.

