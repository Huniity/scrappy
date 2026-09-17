# Validators

`EventValidator.cs` contém a classe estática `Validator`, responsável por
regras de entrada que são partilhadas pelo create, update e pesquisa de
eventos. O serviço chama estas funções e converte `false` em
`Result<T>.Failure(...)`.

## Grupos de validação

| Grupo | Regras principais |
| --- | --- |
| Enumerações e geografia | Distrito, tipo, localidade, região e estado têm de ser valores definidos; país é `PT`; DICO tem quatro dígitos. |
| Texto | Título entre 3 e 250 caracteres; descrição entre 10 e 2000; pesquisa até 100; URLs absolutas HTTP/HTTPS com host. |
| Datas | `startDate` é obrigatório; `endDate` não pode precedê-lo; `doorTime` não pode ser posterior ao início. |
| Paginação/ordenação | Página ≥ 1, `pageSize` entre 1 e 100 e apenas os `sortBy` documentados (`date`, `quality`, `title`, `location`, `type` com `asc`/`desc`). |
| Localização | Nome e localidade obrigatórios; país, distrito/região, DICO e coordenadas coerentes. Coordenadas podem estar ambas ausentes, mas não apenas uma. |
| Horários | Datas dentro do intervalo do evento, horas `H:mm`/`HH:mm`, fim ≥ início, timezone reconhecido e dias de repetição sem duplicados. |
| Ofertas | Até 50, nome/preço/moeda válidos, disponibilidade Schema.org permitida, URL opcional e `ValidFrom` dentro do evento; identidades não podem repetir-se. |
| Agentes e audiência | Até 50 agentes/audiências; nomes, tipos e URLs válidos; limites individuais de texto respeitados. |
| Keywords | Até 50, cada uma até 100 caracteres, sem vazios nem duplicados após normalização. |
| Duplicados | Os helpers `IsDuplicateOnCreate`/`IsDuplicateOnUpdate` procuram título, distrito e data de início iguais, excluindo o próprio ID no update. A ingestão principal usa ainda `EventDeduplicationService` para comparar fontes e localizações. |

## Convenções

- Métodos `Is...`/`Are...` não fazem I/O e devolvem apenas `bool`.
- A validação aceita `null` nos campos opcionais; a obrigatoriedade depende do
  fluxo (por exemplo, `IsCreateLocationValid` é diferente de `IsLocationValid`).
- Normalização (trim, UTC, descrição fallback) fica em `Services`, depois da
  validação estrutural necessária.
- Ao alterar um limite, atualizar este README, os DTOs e eventuais mensagens de
  erro ou documentação OpenAPI.

O validator não deve conhecer HTTP nem escrever respostas. Essa tradução é
responsabilidade do serviço/controller.
