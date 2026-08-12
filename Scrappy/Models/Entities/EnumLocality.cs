

using System.ComponentModel.DataAnnotations;
using Scrappy.Models;

namespace Scrappy.Models.Entities;

/// <summary>
/// Administrative localities of Portugal.
/// </summary>
public enum LocalityName
{
    /// <summary>Locality of Abrantes</summary>
    Abrantes,

    /// <summary>Locality of Águeda</summary>
    Águeda,

    /// <summary>Locality of Aguiar da Beira</summary>
    [Display(Name = "Aguiar da Beira")]
    AguiarDaBeira,

    /// <summary>Locality of Alandroal</summary>
    Alandroal,

    /// <summary>Locality of Albergaria-a-Velha</summary>
    [Display(Name = "Albergaria-a-Velha")]
    AlbergariaAVelha,

    /// <summary>Locality of Albufeira</summary>
    Albufeira,

    /// <summary>Locality of Alcácer do Sal</summary>
    [Display(Name = "Alcácer do Sal")]
    AlcácerDoSal,

    /// <summary>Locality of Alcanena</summary>
    Alcanena,

    /// <summary>Locality of Alcobaça</summary>
    Alcobaça,

    /// <summary>Locality of Alcochete</summary>
    Alcochete,

    /// <summary>Locality of Alcoutim</summary>
    Alcoutim,

    /// <summary>Locality of Alenquer</summary>
    Alenquer,

    /// <summary>Locality of Alfândega da Fé</summary>
    [Display(Name = "Alfândega da Fé")]
    AlfândegaDaFé,

    /// <summary>Locality of Alijó</summary>
    Alijó,

    /// <summary>Locality of Aljezur</summary>
    Aljezur,

    /// <summary>Locality of Aljustrel</summary>
    Aljustrel,

    /// <summary>Locality of Almada</summary>
    Almada,

    /// <summary>Locality of Almeida</summary>
    Almeida,

    /// <summary>Locality of Almeirim</summary>
    Almeirim,

    /// <summary>Locality of Almodôvar</summary>
    Almodôvar,

    /// <summary>Locality of Alpiarça</summary>
    Alpiarça,

    /// <summary>Locality of Alter do Chão</summary>
    [Display(Name = "Alter do Chão")]
    AlterDoChão,

    /// <summary>Locality of Alvaiázere</summary>
    Alvaiázere,

    /// <summary>Locality of Alvito</summary>
    Alvito,

    /// <summary>Locality of Amadora</summary>
    Amadora,

    /// <summary>Locality of Amarante</summary>
    Amarante,

    /// <summary>Locality of Amares</summary>
    Amares,

    /// <summary>Locality of Anadia</summary>
    Anadia,

    /// <summary>Locality of Angra do Heroísmo</summary>
    [Display(Name = "Angra do Heroísmo")]
    AngraDoHeroísmo,

    /// <summary>Locality of Ansião</summary>
    Ansião,

    /// <summary>Locality of Arcos de Valdevez</summary>
    [Display(Name = "Arcos de Valdevez")]
    ArcosDeValdevez,

    /// <summary>Locality of Arganil</summary>
    Arganil,

    /// <summary>Locality of Armamar</summary>
    Armamar,

    /// <summary>Locality of Arouca</summary>
    Arouca,

    /// <summary>Locality of Arraiolos</summary>
    Arraiolos,

    /// <summary>Locality of Arronches</summary>
    Arronches,

    /// <summary>Locality of Arruda dos Vinhos</summary>
    [Display(Name = "Arruda dos Vinhos")]
    ArrudaDosVinhos,

    /// <summary>Locality of Aveiro</summary>
    Aveiro,

    /// <summary>Locality of Avis</summary>
    Avis,

    /// <summary>Locality of Azambuja</summary>
    Azambuja,

    /// <summary>Locality of Baião</summary>
    Baião,

    /// <summary>Locality of Barcelos</summary>
    Barcelos,

    /// <summary>Locality of Barrancos</summary>
    Barrancos,

    /// <summary>Locality of Barreiro</summary>
    Barreiro,

    /// <summary>Locality of Batalha</summary>
    Batalha,

    /// <summary>Locality of Beja</summary>
    Beja,

    /// <summary>Locality of Belmonte</summary>
    Belmonte,

    /// <summary>Locality of Benavente</summary>
    Benavente,

    /// <summary>Locality of Bombarral</summary>
    Bombarral,

    /// <summary>Locality of Borba</summary>
    Borba,

    /// <summary>Locality of Boticas</summary>
    Boticas,

    /// <summary>Locality of Braga</summary>
    Braga,

    /// <summary>Locality of Bragança</summary>
    Bragança,

    /// <summary>Locality of Cabeceiras de Basto</summary>
    [Display(Name = "Cabeceiras de Basto")]
    CabeceirasDeBasto,

    /// <summary>Locality of Cadaval</summary>
    Cadaval,

    /// <summary>Locality of Caldas da Rainha</summary>
    [Display(Name = "Caldas da Rainha")]
    CaldasDaRainha,

    /// <summary>Locality of Calheta (Açores)</summary>
    [Display(Name = "Calheta (Açores)")]
    CalhetaAçores,

    /// <summary>Locality of Calheta (Madeira)</summary>
    [Display(Name = "Calheta (Madeira)")]
    CalhetaMadeira,

    /// <summary>Locality of Câmara de Lobos</summary>
    [Display(Name = "Câmara de Lobos")]
    CâmaraDeLobos,

    /// <summary>Locality of Caminha</summary>
    Caminha,

    /// <summary>Locality of Campo Maior</summary>
    [Display(Name = "Campo Maior")]
    CampoMaior,

    /// <summary>Locality of Cantanhede</summary>
    Cantanhede,

    /// <summary>Locality of Carrazeda de Ansiães</summary>
    [Display(Name = "Carrazeda de Ansiães")]
    CarrazedaDeAnsiães,

    /// <summary>Locality of Carregal do Sal</summary>
    [Display(Name = "Carregal do Sal")]
    CarregalDoSal,

    /// <summary>Locality of Cartaxo</summary>
    Cartaxo,

    /// <summary>Locality of Cascais</summary>
    Cascais,

    /// <summary>Locality of Castelo de Vide</summary>
    [Display(Name = "Castelo de Vide")]
    CasteloDeVide,

    /// <summary>Locality of Castelo de Paiva</summary>
    [Display(Name = "Castelo de Paiva")]
    CasteloDePaiva,

    /// <summary>Locality of Castelo Branco</summary>
    [Display(Name = "Castelo Branco")]
    CasteloBranco,

    /// <summary>Locality of Castro Daire</summary>
    [Display(Name = "Castro Daire")]
    CastroDaire,

    /// <summary>Locality of Castro Marim</summary>
    [Display(Name = "Castro Marim")]
    CastroMarim,

    /// <summary>Locality of Castro Verde</summary>
    [Display(Name = "Castro Verde")]
    CastroVerde,

    /// <summary>Locality of Celorico da Beira</summary>
    [Display(Name = "Celorico da Beira")]
    CeloricoDaBeira,

    /// <summary>Locality of Celorico de Basto</summary>
    [Display(Name = "Celorico de Basto")]
    CeloricoDeBasto,

    /// <summary>Locality of Chamusca</summary>
    Chamusca,

    /// <summary>Locality of Chaves</summary>
    Chaves,

    /// <summary>Locality of Cinfães</summary>
    Cinfães,

    /// <summary>Locality of Coimbra</summary>
    Coimbra,

    /// <summary>Locality of Condeixa-a-Nova</summary>
    [Display(Name = "Condeixa-a-Nova")]
    CondeixaANova,

    /// <summary>Locality of Constância</summary>
    Constância,

    /// <summary>Locality of Coruche</summary>
    Coruche,

    /// <summary>Locality of Corvo</summary>
    Corvo,

    /// <summary>Locality of Covilhã</summary>
    Covilhã,

    /// <summary>Locality of Crato</summary>
    Crato,

    /// <summary>Locality of Cuba</summary>
    Cuba,

    /// <summary>Locality of Elvas</summary>
    Elvas,

    /// <summary>Locality of Entroncamento</summary>
    Entroncamento,

    /// <summary>Locality of Espinho</summary>
    Espinho,

    /// <summary>Locality of Esposende</summary>
    Esposende,

    /// <summary>Locality of Estarreja</summary>
    Estarreja,

    /// <summary>Locality of Estremoz</summary>
    Estremoz,

    /// <summary>Locality of Évora</summary>
    Évora,

    /// <summary>Locality of Fafe</summary>
    Fafe,

    /// <summary>Locality of Faro</summary>
    Faro,

    /// <summary>Locality of Felgueiras</summary>
    Felgueiras,

    /// <summary>Locality of Ferreira do Zêzere</summary>
    [Display(Name = "Ferreira do Zêzere")]
    FerreiraDoZêzere,

    /// <summary>Locality of Ferreira do Alentejo</summary>
    [Display(Name = "Ferreira do Alentejo")]
    FerreiraDoAlentejo,

    /// <summary>Locality of Figueira da Foz</summary>
    [Display(Name = "Figueira da Foz")]
    FigueiraDaFoz,

    /// <summary>Locality of Figueira de Castelo Rodrigo</summary>
    [Display(Name = "Figueira de Castelo Rodrigo")]
    FigueiraDeCasteloRodrigo,

    /// <summary>Locality of Figueiró dos Vinhos</summary>
    [Display(Name = "Figueiró dos Vinhos")]
    FigueiróDosVinhos,

    /// <summary>Locality of Fornos de Algodres</summary>
    [Display(Name = "Fornos de Algodres")]
    FornosDeAlgodres,

    /// <summary>Locality of Freixo de Espada à Cinta</summary>
    [Display(Name = "Freixo de Espada à Cinta")]
    FreixoDeEspadaÀCinta,

    /// <summary>Locality of Fronteira</summary>
    Fronteira,

    /// <summary>Locality of Funchal</summary>
    Funchal,

    /// <summary>Locality of Fundão</summary>
    Fundão,

    /// <summary>Locality of Gavião</summary>
    Gavião,

    /// <summary>Locality of Góis</summary>
    Góis,

    /// <summary>Locality of Golegã</summary>
    Golegã,

    /// <summary>Locality of Gondomar</summary>
    Gondomar,

    /// <summary>Locality of Gouveia</summary>
    Gouveia,

    /// <summary>Locality of Grândola</summary>
    Grândola,

    /// <summary>Locality of Guarda</summary>
    Guarda,

    /// <summary>Locality of Guimarães</summary>
    Guimarães,

    /// <summary>Locality of Horta</summary>
    Horta,

    /// <summary>Locality of Idanha-a-Nova</summary>
    [Display(Name = "Idanha-a-Nova")]
    IdanhaANova,

    /// <summary>Locality of Ílhavo</summary>
    Ílhavo,

    /// <summary>Locality of Lagoa (Açores)</summary>
    [Display(Name = "Lagoa (Açores)")]
    LagoaAçores,

    /// <summary>Locality of Lagoa (Algarve)</summary>
    [Display(Name = "Lagoa (Algarve)")]
    LagoaAlgarve,

    /// <summary>Locality of Lagos</summary>
    Lagos,

    /// <summary>Locality of Lajes das Flores</summary>
    [Display(Name = "Lajes das Flores")]
    LajesDasFlores,

    /// <summary>Locality of Lajes do Pico</summary>
    [Display(Name = "Lajes do Pico")]
    LajesDoPico,

    /// <summary>Locality of Lamego</summary>
    Lamego,

    /// <summary>Locality of Leiria</summary>
    Leiria,

    /// <summary>Locality of Lisboa</summary>
    Lisboa,

    /// <summary>Locality of Loulé</summary>
    Loulé,

    /// <summary>Locality of Loures</summary>
    Loures,

    /// <summary>Locality of Lourinhã</summary>
    Lourinhã,

    /// <summary>Locality of Lousã</summary>
    Lousã,

    /// <summary>Locality of Lousada</summary>
    Lousada,

    /// <summary>Locality of Mação</summary>
    Mação,

    /// <summary>Locality of Macedo de Cavaleiros</summary>
    [Display(Name = "Macedo de Cavaleiros")]
    MacedoDeCavaleiros,

    /// <summary>Locality of Machico</summary>
    Machico,

    /// <summary>Locality of Madalena</summary>
    Madalena,

    /// <summary>Locality of Mafra</summary>
    Mafra,

    /// <summary>Locality of Maia</summary>
    Maia,

    /// <summary>Locality of Mangualde</summary>
    Mangualde,

    /// <summary>Locality of Manteigas</summary>
    Manteigas,

    /// <summary>Locality of Marco de Canaveses</summary>
    [Display(Name = "Marco de Canaveses")]
    MarcoDeCanaveses,

    /// <summary>Locality of Marinha Grande</summary>
    [Display(Name = "Marinha Grande")]
    MarinhaGrande,

    /// <summary>Locality of Marvão</summary>
    Marvão,

    /// <summary>Locality of Matosinhos</summary>
    Matosinhos,

    /// <summary>Locality of Mealhada</summary>
    Mealhada,

    /// <summary>Locality of Mêda</summary>
    Mêda,

    /// <summary>Locality of Melgaço</summary>
    Melgaço,

    /// <summary>Locality of Mértola</summary>
    Mértola,

    /// <summary>Locality of Mesão Frio</summary>
    [Display(Name = "Mesão Frio")]
    MesãoFrio,

    /// <summary>Locality of Mira</summary>
    Mira,

    /// <summary>Locality of Miranda do Corvo</summary>
    [Display(Name = "Miranda do Corvo")]
    MirandaDoCorvo,

    /// <summary>Locality of Miranda do Douro</summary>
    [Display(Name = "Miranda do Douro")]
    MirandaDoDouro,

    /// <summary>Locality of Mirandela</summary>
    Mirandela,

    /// <summary>Locality of Mogadouro</summary>
    Mogadouro,

    /// <summary>Locality of Moita</summary>
    Moita,

    /// <summary>Locality of Monchique</summary>
    Monchique,

    /// <summary>Locality of Mondim de Basto</summary>
    [Display(Name = "Mondim de Basto")]
    MondimDeBasto,

    /// <summary>Locality of Monforte</summary>
    Monforte,

    /// <summary>Locality of Montalegre</summary>
    Montalegre,

    /// <summary>Locality of Montemor-o-Novo</summary>
    [Display(Name = "Montemor-o-Novo")]
    MontemorONovo,

    /// <summary>Locality of Montemor-o-Velho</summary>
    [Display(Name = "Montemor-o-Velho")]
    MontemorOVelho,

    /// <summary>Locality of Montijo</summary>
    Montijo,

    /// <summary>Locality of Monção</summary>
    Monção,

    /// <summary>Locality of Mora</summary>
    Mora,

    /// <summary>Locality of Mortágua</summary>
    Mortágua,

    /// <summary>Locality of Moura</summary>
    Moura,

    /// <summary>Locality of Mourão</summary>
    Mourão,

    /// <summary>Locality of Murça</summary>
    Murça,

    /// <summary>Locality of Murtosa</summary>
    Murtosa,

    /// <summary>Locality of Nazaré</summary>
    Nazaré,

    /// <summary>Locality of Nelas</summary>
    Nelas,

    /// <summary>Locality of Nisa</summary>
    Nisa,

    /// <summary>Locality of Nordeste</summary>
    Nordeste,

    /// <summary>Locality of Óbidos</summary>
    Óbidos,

    /// <summary>Locality of Odemira</summary>
    Odemira,

    /// <summary>Locality of Odivelas</summary>
    Odivelas,

    /// <summary>Locality of Oeiras</summary>
    Oeiras,

    /// <summary>Locality of Oleiros</summary>
    Oleiros,

    /// <summary>Locality of Olhão</summary>
    Olhão,

    /// <summary>Locality of Oliveira de Azeméis</summary>
    [Display(Name = "Oliveira de Azeméis")]
    OliveiraDeAzeméis,

    /// <summary>Locality of Oliveira de Frades</summary>
    [Display(Name = "Oliveira de Frades")]
    OliveiraDeFrades,

    /// <summary>Locality of Oliveira do Bairro</summary>
    [Display(Name = "Oliveira do Bairro")]
    OliveiraDoBairro,

    /// <summary>Locality of Oliveira do Hospital</summary>
    [Display(Name = "Oliveira do Hospital")]
    OliveiraDoHospital,

    /// <summary>Locality of Ourém</summary>
    Ourém,

    /// <summary>Locality of Ourique</summary>
    Ourique,

    /// <summary>Locality of Oovar</summary>
    Ovar,

    /// <summary>Locality of Paços de Ferreira</summary>
    [Display(Name = "Paços de Ferreira")]
    PaçosDeFerreira,

    /// <summary>Locality of Palmela</summary>
    Palmela,

    /// <summary>Locality of Pampilhosa da Serra</summary>
    [Display(Name = "Pampilhosa da Serra")]
    PampilhosaDaSerra,

    /// <summary>Locality of Paredes</summary>
    Paredes,

    /// <summary>Locality of Paredes de Coura</summary>
    [Display(Name = "Paredes de Coura")]
    ParedesDeCoura,

    /// <summary>Locality of Pedroso / Vila Nova de Gaia</summary>
    Pedroso,

    /// <summary>Locality of Pedrógão Grande</summary>
    [Display(Name = "Pedrógão Grande")]
    PedrógãoGrande,

    /// <summary>Locality of Penacova</summary>
    Penacova,

    /// <summary>Locality of Penafiel</summary>
    Penafiel,

    /// <summary>Locality of Penalva do Castelo</summary>
    [Display(Name = "Penalva do Castelo")]
    PenalvaDoCastelo,

    /// <summary>Locality of Penamacor</summary>
    Penamacor,

    /// <summary>Locality of Penedono</summary>
    Penedono,

    /// <summary>Locality of Penela</summary>
    Penela,

    /// <summary>Locality of Peniche</summary>
    Peniche,

    /// <summary>Locality of Peso da Régua</summary>
    [Display(Name = "Peso da Régua")]
    PesoDaRégua,

    /// <summary>Locality of Pinhel</summary>
    Pinhel,

    /// <summary>Locality of Pombal</summary>
    Pombal,

    /// <summary>Locality of Ponta Delgada</summary>
    [Display(Name = "Ponta Delgada")]
    PontaDelgada,

    /// <summary>Locality of Ponta do Sol</summary>
    [Display(Name = "Ponta do Sol")]
    PontaDoSol,

    /// <summary>Locality of Ponte da Barca</summary>
    [Display(Name = "Ponte da Barca")]
    PonteDaBarca,

    /// <summary>Locality of Ponte de Lima</summary>
    [Display(Name = "Ponte de Lima")]
    PonteDeLima,

    /// <summary>Locality of Ponte de Sor</summary>
    [Display(Name = "Ponte de Sor")]
    PonteDeSor,

    /// <summary>Locality of Portalegre</summary>
    Portalegre,

    /// <summary>Locality of Portel</summary>
    Portel,

    /// <summary>Locality of Portimão</summary>
    Portimão,

    /// <summary>Locality of Porto</summary>
    Porto,

    /// <summary>Locality of Porto de Mós</summary>
    [Display(Name = "Porto de Mós")]
    PortoDeMós,

    /// <summary>Locality of Porto Moniz</summary>
    [Display(Name = "Porto Moniz")]
    PortoMoniz,

    /// <summary>Locality of Porto Santo</summary>
    [Display(Name = "Porto Santo")]
    PortoSanto,

    /// <summary>Locality of Póvoa de Lanhoso</summary>
    [Display(Name = "Póvoa de Lanhoso")]
    PóvoaDeLanhoso,

    /// <summary>Locality of Póvoa de Varzim</summary>
    [Display(Name = "Póvoa de Varzim")]
    PóvoaDeVarzim,

    /// <summary>Locality of Povoação</summary>
    Povoação,

    /// <summary>Locality of Praia da Vitória</summary>
    [Display(Name = "Praia da Vitória")]
    PraiaDaVitória,

    /// <summary>Locality of Proença-a-Nova</summary>
    [Display(Name = "Proença-a-Nova")]
    ProençaANova,

    /// <summary>Locality of Redondo</summary>
    Redondo,

    /// <summary>Locality of Reguengos de Monsaraz</summary>
    [Display(Name = "Reguengos de Monsaraz")]
    ReguengosDeMonsaraz,

    /// <summary>Locality of Resende</summary>
    Resende,

    /// <summary>Locality of Ribeira Brava</summary>
    [Display(Name = "Ribeira Brava")]
    RibeiraBrava,

    /// <summary>Locality of Ribeira de Pena</summary>
    [Display(Name = "Ribeira de Pena")]
    RibeiraDePena,

    /// <summary>Locality of Ribeira Grande</summary>
    [Display(Name = "Ribeira Grande")]
    RibeiraGrande,

    /// <summary>Locality of Rio Maior</summary>
    [Display(Name = "Rio Maior")]
    RioMaior,

    /// <summary>Locality of Sabrosa</summary>
    Sabrosa,

    /// <summary>Locality of Sabugal</summary>
    Sabugal,

    /// <summary>Locality of Salvaterra de Magos</summary>
    [Display(Name = "Salvaterra de Magos")]
    SalvaterraDeMagos,

    /// <summary>Locality of Santa Comba Dão</summary>
    [Display(Name = "Santa Comba Dão")]
    SantaCombaDão,

    /// <summary>Locality of Santa Cruz</summary>
    [Display(Name = "Santa Cruz")]
    SantaCruz,

    /// <summary>Locality of Santa Cruz da Graciosa</summary>
    [Display(Name = "Santa Cruz da Graciosa")]
    SantaCruzDaGraciosa,

    /// <summary>Locality of Santa Cruz das Flores</summary>
    [Display(Name = "Santa Cruz das Flores")]
    SantaCruzDasFlores,

    /// <summary>Locality of Santa Maria da Feira</summary>
    [Display(Name = "Santa Maria da Feira")]
    SantaMariaDaFeira,

    /// <summary>Locality of Santana</summary>
    Santana,

    /// <summary>Locality of Santarém</summary>
    Santarém,

    /// <summary>Locality of Santiago do Cacém</summary>
    [Display(Name = "Santiago do Cacém")]
    SantiagoDoCacém,

    /// <summary>Locality of Santo Tirso</summary>
    [Display(Name = "Santo Tirso")]
    SantoTirso,

    /// <summary>Locality of São Brás de Alportel</summary>
    [Display(Name = "São Brás de Alportel")]
    SãoBrásDeAlportel,

    /// <summary>Locality of São João da Madeira</summary>
    [Display(Name = "São João da Madeira")]
    SãoJoãoDaMadeira,

    /// <summary>Locality of São João da Pesqueira</summary>
    [Display(Name = "São João da Pesqueira")]
    SãoJoãoDaPesqueira,

    /// <summary>Locality of São Pedro do Sul</summary>
    [Display(Name = "São Pedro do Sul")]
    SãoPedroDoSul,

    /// <summary>Locality of São Roque do Pico</summary>
    [Display(Name = "São Roque do Pico")]
    SãoRoqueDoPico,

    /// <summary>Locality of Sardoal</summary>
    Sardoal,

    /// <summary>Locality of Sátão</summary>
    Sátão,

    /// <summary>Locality of Seixal</summary>
    Seixal,

    /// <summary>Locality of Sernancelhe</summary>
    Sernancelhe,

    /// <summary>Locality of Serpa</summary>
    Serpa,

    /// <summary>Locality of Sertã</summary>
    Sertã,

    /// <summary>Locality of Sesimbra</summary>
    Sesimbra,

    /// <summary>Locality of Setúbal</summary>
    Setúbal,

    /// <summary>Locality of Sever do Vouga</summary>
    [Display(Name = "Sever do Vouga")]
    SeverDoVouga,

    /// <summary>Locality of Silves</summary>
    Silves,

    /// <summary>Locality of Sines</summary>
    Sines,

    /// <summary>Locality of Sintra</summary>
    Sintra,

    /// <summary>Locality of Sobral de Monte Agraço</summary>
    [Display(Name = "Sobral de Monte Agraço")]
    SobralDeMonteAgraço,

    /// <summary>Locality of Soure</summary>
    Soure,

    /// <summary>Locality of Sousel</summary>
    Sousel,

    /// <summary>Locality of Tábua</summary>
    Tábua,

    /// <summary>Locality of Tabuaço</summary>
    Tabuaço,

    /// <summary>Locality of Tarouca</summary>
    Tarouca,

    /// <summary>Locality of Tavira</summary>
    Tavira,

    /// <summary>Locality of Terras de Bouro</summary>
    [Display(Name = "Terras de Bouro")]
    TerrasDeBouro,

    /// <summary>Locality of Tomar</summary>
    Tomar,

    /// <summary>Locality of Tondela</summary>
    Tondela,

    /// <summary>Locality of Torre de Moncorvo</summary>
    [Display(Name = "Torre de Moncorvo")]
    TorreDeMoncorvo,

    /// <summary>Locality of Torres Novas</summary>
    [Display(Name = "Torres Novas")]
    TorresNovas,

    /// <summary>Locality of Torres Vedras</summary>
    [Display(Name = "Torres Vedras")]
    TorresVedras,

    /// <summary>Locality of Trancoso</summary>
    Trancoso,

    /// <summary>Locality of Trofa</summary>
    Trofa,

    /// <summary>Locality of Vagos</summary>
    Vagos,

    /// <summary>Locality of Vale de Cambra</summary>
    [Display(Name = "Vale de Cambra")]
    ValeDeCambra,

    /// <summary>Locality of Valpaços</summary>
    Valpaços,

    /// <summary>Locality of Valença</summary>
    Valença,

    /// <summary>Locality of Valongo</summary>
    Valongo,

    /// <summary>Locality of Velas</summary>
    Velas,

    /// <summary>Locality of Vendas Novas</summary>
    [Display(Name = "Vendas Novas")]
    VendasNovas,

    /// <summary>Locality of Viana do Alentejo</summary>
    [Display(Name = "Viana do Alentejo")]
    VianaDoAlentejo,

    /// <summary>Locality of Viana do Castelo</summary>
    [Display(Name = "Viana do Castelo")]
    VianaDoCastelo,

    /// <summary>Locality of Vidigueira</summary>
    Vidigueira,

    /// <summary>Locality of Vieira do Minho</summary>
    [Display(Name = "Vieira do Minho")]
    VieiraDoMinho,

    /// <summary>Locality of Vila de Rei</summary>
    [Display(Name = "Vila de Rei")]
    VilaDeRei,

    /// <summary>Locality of Vila do Bispo</summary>
    [Display(Name = "Vila do Bispo")]
    VilaDoBispo,

    /// <summary>Locality of Vila do Conde</summary>
    [Display(Name = "Vila do Conde")]
    VilaDoConde,

    /// <summary>Locality of Vila do Porto</summary>
    [Display(Name = "Vila do Porto")]
    VilaDoPorto,

    /// <summary>Locality of Vila Flor</summary>
    [Display(Name = "Vila Flor")]
    VilaFlor,

    /// <summary>Locality of Vila Franca de Xira</summary>
    [Display(Name = "Vila Franca de Xira")]
    VilaFrancaDeXira,

    /// <summary>Locality of Vila Franca do Campo</summary>
    [Display(Name = "Vila Franca do Campo")]
    VilaFrancaDoCampo,

    /// <summary>Locality of Vila Nova da Barquinha</summary>
    [Display(Name = "Vila Nova da Barquinha")]
    VilaNovaDaBarquinha,

    /// <summary>Locality of Vila Nova de Cerveira</summary>
    [Display(Name = "Vila Nova de Cerveira")]
    VilaNovaDeCerveira,

    /// <summary>Locality of Vila Nova de Famalicão</summary>
    [Display(Name = "Vila Nova de Famalicão")]
    VilaNovaDeFamalicão,

    /// <summary>Locality of Vila Nova de Foz Côa</summary>
    [Display(Name = "Vila Nova de Foz Côa")]
    VilaNovaDeFozCôa,

    /// <summary>Locality of Vila Nova de Gaia</summary>
    [Display(Name = "Vila Nova de Gaia")]
    VilaNovaDeGaia,

    /// <summary>Locality of Vila Nova de Poiares</summary>
    [Display(Name = "Vila Nova de Poiares")]
    VilaNovaDePoiares,

    /// <summary>Locality of Vila Pouca de Aguiar</summary>
    [Display(Name = "Vila Pouca de Aguiar")]
    VilaPoucaDeAguiar,

    /// <summary>Locality of Vila Real</summary>
    [Display(Name = "Vila Real")]
    VilaReal,

    /// <summary>Locality of Vila Real de Santo António</summary>
    [Display(Name = "Vila Real de Santo António")]
    VilaRealDeSantoAntónio,

    /// <summary>Locality of Vila Velha de Ródão</summary>
    [Display(Name = "Vila Velha de Ródão")]
    VilaVelhaDeRódão,

    /// <summary>Locality of Vila Verde</summary>
    [Display(Name = "Vila Verde")]
    VilaVerde,

    /// <summary>Locality of Vila Viçosa</summary>
    [Display(Name = "Vila Viçosa")]
    VilaViçosa,

    /// <summary>Locality of Vimioso</summary>
    Vimioso,

    /// <summary>Locality of Vinhais</summary>
    Vinhais,

    /// <summary>Locality of Viseu</summary>
    Viseu,

    /// <summary>Locality of Vizela</summary>
    Vizela,

    /// <summary>Locality of Vouzela</summary>
    Vouzela
}