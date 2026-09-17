# Services/Interfaces

Esta subpasta contém abstrações consumidas pelos serviços. Atualmente existe
uma interface:

| Ficheiro | Responsabilidade |
| --- | --- |
| `IGeoDataService.cs` | Define `Lookup(LocalityName)`, que devolve distrito, região NUTS2 e código DICO para uma localidade. |

`GeoDataService` é a implementação atual e está registada como singleton. A
interface permite substituir a tabela estática por outra fonte ou por um mock
em testes sem alterar `EventService`.

Uma nova interface deve representar uma fronteira real (persistência, serviço
externo ou relógio) e ser registada no contentor de DI. Não criar interfaces
apenas para envolver classes sem comportamento substituível.
