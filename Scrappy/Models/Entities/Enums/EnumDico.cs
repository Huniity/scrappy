
using System.ComponentModel.DataAnnotations;
using Scrappy.Models;
using System.ComponentModel;

namespace Scrappy.Models.Entities.Enums;

/// <summary>
/// Administrative region divisions of Portugal that follows DICO.
/// 
/// Example:
/// - Concelho (County) of Abrantes in the District of Santarém has a DICO code of 1401.
/// </summary>

public enum DicoEnum : ushort
{
    // 01 - AVEIRO
    [Description("Águeda")]
    Aveiro_Agueda = 101,

    [Description("Albergaria-a-Velha")]
    Aveiro_AlbergariaAVelha = 102,

    [Description("Anadia")]
    Aveiro_Anadia = 103,

    [Description("Arouca")]
    Aveiro_Arouca = 104,

    [Description("Aveiro")]
    Aveiro_Aveiro = 105,

    [Description("Castelo de Paiva")]
    Aveiro_CasteloDePaiva = 106,

    [Description("Espinho")]
    Aveiro_Espinho = 107,

    [Description("Estarreja")]
    Aveiro_Estarreja = 108,

    [Description("Santa Maria da Feira")]
    Aveiro_SantaMariaDaFeira = 109,

    [Description("Ílhavo")]
    Aveiro_Ilhavo = 110,

    [Description("Mealhada")]
    Aveiro_Mealhada = 111,

    [Description("Murtosa")]
    Aveiro_Murtosa = 112,

    [Description("Oliveira de Azeméis")]
    Aveiro_OliveiraDeAzemeis = 113,

    [Description("Oliveira do Bairro")]
    Aveiro_OliveiraDoBairro = 114,

    [Description("Ovar")]
    Aveiro_Ovar = 115,

    [Description("São João da Madeira")]
    Aveiro_SaoJoaoDaMadeira = 116,

    [Description("Sever do Vouga")]
    Aveiro_SeverDoVouga = 117,

    [Description("Vagos")]
    Aveiro_Vagos = 118,

    [Description("Vale de Cambra")]
    Aveiro_ValeDeCambra = 119,


    // 02 - BEJA
    [Description("Aljustrel")]
    Beja_Aljustrel = 201,

    [Description("Almodôvar")]
    Beja_Almodovar = 202,

    [Description("Alvito")]
    Beja_Alvito = 203,

    [Description("Barrancos")]
    Beja_Barrancos = 204,

    [Description("Beja")]
    Beja_Beja = 205,

    [Description("Castro Verde")]
    Beja_CastroVerde = 206,

    [Description("Cuba")]
    Beja_Cuba = 207,

    [Description("Ferreira do Alentejo")]
    Beja_FerreiraDoAlentejo = 208,

    [Description("Mértola")]
    Beja_Mertola = 209,

    [Description("Moura")]
    Beja_Moura = 210,

    [Description("Odemira")]
    Beja_Odemira = 211,

    [Description("Ourique")]
    Beja_Ourique = 212,

    [Description("Serpa")]
    Beja_Serpa = 213,

    [Description("Vidigueira")]
    Beja_Vidigueira = 214,


    // 03 - BRAGA
    [Description("Amares")]
    Braga_Amares = 301,

    [Description("Barcelos")]
    Braga_Barcelos = 302,

    [Description("Braga")]
    Braga_Braga = 303,

    [Description("Cabeceiras de Basto")]
    Braga_CabeceirasDeBasto = 304,

    [Description("Celorico de Basto")]
    Braga_CeloricoDeBasto = 305,

    [Description("Esposende")]
    Braga_Esposende = 306,

    [Description("Fafe")]
    Braga_Fafe = 307,

    [Description("Guimarães")]
    Braga_Guimaraes = 308,

    [Description("Póvoa de Lanhoso")]
    Braga_PovoaDeLanhoso = 309,

    [Description("Terras de Bouro")]
    Braga_TerrasDeBouro = 310,

    [Description("Vieira do Minho")]
    Braga_VieiraDoMinho = 311,

    [Description("Vila Nova de Famalicão")]
    Braga_VilaNovaDeFamalicao = 312,

    [Description("Vila Verde")]
    Braga_VilaVerde = 313,

    [Description("Vizela")]
    Braga_Vizela = 314,


    // 04 - BRAGANÇA
    [Description("Alfândega da Fé")]
    Braganca_AlfandegaDaFe = 401,

    [Description("Bragança")]
    Braganca_Braganca = 402,

    [Description("Carrazeda de Ansiães")]
    Braganca_CarrazedaDeAnsiaes = 403,

    [Description("Freixo de Espada à Cinta")]
    Braganca_FreixoDeEspadaACinta = 404,

    [Description("Macedo de Cavaleiros")]
    Braganca_MacedoDeCavaleiros = 405,

    [Description("Miranda do Douro")]
    Braganca_MirandaDoDouro = 406,

    [Description("Mirandela")]
    Braganca_Mirandela = 407,

    [Description("Mogadouro")]
    Braganca_Mogadouro = 408,

    [Description("Torre de Moncorvo")]
    Braganca_TorreDeMoncorvo = 409,

    [Description("Vila Flor")]
    Braganca_VilaFlor = 410,

    [Description("Vimioso")]
    Braganca_Vimioso = 411,

    [Description("Vinhais")]
    Braganca_Vinhais = 412,


    // 05 - CASTELO BRANCO
    [Description("Belmonte")]
    CasteloBranco_Belmonte = 501,

    [Description("Castelo Branco")]
    CasteloBranco_CasteloBranco = 502,

    [Description("Covilhã")]
    CasteloBranco_Covilha = 503,

    [Description("Fundão")]
    CasteloBranco_Fundao = 504,

    [Description("Idanha-a-Nova")]
    CasteloBranco_IdanhaANova = 505,

    [Description("Oleiros")]
    CasteloBranco_Oleiros = 506,

    [Description("Penamacor")]
    CasteloBranco_Penamacor = 507,

    [Description("Proença-a-Nova")]
    CasteloBranco_ProencaANova = 508,

    [Description("Sertã")]
    CasteloBranco_Serta = 509,

    [Description("Vila de Rei")]
    CasteloBranco_VilaDeRei = 510,

    [Description("Vila Velha de Ródão")]
    CasteloBranco_VilaVelhaDeRodao = 511,


    // 06 - COIMBRA
    [Description("Arganil")]
    Coimbra_Arganil = 601,

    [Description("Cantanhede")]
    Coimbra_Cantanhede = 602,

    [Description("Coimbra")]
    Coimbra_Coimbra = 603,

    [Description("Condeixa-a-Nova")]
    Coimbra_CondeixaANova = 604,

    [Description("Figueira da Foz")]
    Coimbra_FigueiraDaFoz = 605,

    [Description("Góis")]
    Coimbra_Gois = 606,

    [Description("Lousã")]
    Coimbra_Lousa = 607,

    [Description("Mira")]
    Coimbra_Mira = 608,

    [Description("Miranda do Corvo")]
    Coimbra_MirandaDoCorvo = 609,

    [Description("Montemor-o-Velho")]
    Coimbra_MontemorOVelho = 610,

    [Description("Oliveira do Hospital")]
    Coimbra_OliveiraDoHospital = 611,

    [Description("Pampilhosa da Serra")]
    Coimbra_PampilhosaDaSerra = 612,

    [Description("Penacova")]
    Coimbra_Penacova = 613,

    [Description("Penela")]
    Coimbra_Penela = 614,

    [Description("Soure")]
    Coimbra_Soure = 615,

    [Description("Tábua")]
    Coimbra_Tabua = 616,

    [Description("Vila Nova de Poiares")]
    Coimbra_VilaNovaDePoiares = 617,


    // 07 - ÉVORA
    [Description("Alandroal")]
    Evora_Alandroal = 701,

    [Description("Arraiolos")]
    Evora_Arraiolos = 702,

    [Description("Borba")]
    Evora_Borba = 703,

    [Description("Estremoz")]
    Evora_Estremoz = 704,

    [Description("Évora")]
    Evora_Evora = 705,

    [Description("Montemor-o-Novo")]
    Evora_MontemorONovo = 706,

    [Description("Mora")]
    Evora_Mora = 707,

    [Description("Mourão")]
    Evora_Mourao = 708,

    [Description("Portel")]
    Evora_Portel = 709,

    [Description("Redondo")]
    Evora_Redondo = 710,

    [Description("Reguengos de Monsaraz")]
    Evora_ReguengosDeMonsaraz = 711,

    [Description("Vendas Novas")]
    Evora_VendasNovas = 712,

    [Description("Viana do Alentejo")]
    Evora_VianaDoAlentejo = 713,

    [Description("Vila Viçosa")]
    Evora_VilaVicosa = 714,


    // 08 - FARO
    [Description("Albufeira")]
    Faro_Albufeira = 801,

    [Description("Alcoutim")]
    Faro_Alcoutim = 802,

    [Description("Aljezur")]
    Faro_Aljezur = 803,

    [Description("Castro Marim")]
    Faro_CastroMarim = 804,

    [Description("Faro")]
    Faro_Faro = 805,

    [Description("Lagoa")]
    Faro_Lagoa = 806,

    [Description("Lagos")]
    Faro_Lagos = 807,

    [Description("Loulé")]
    Faro_Loule = 808,

    [Description("Monchique")]
    Faro_Monchique = 809,

    [Description("Olhão")]
    Faro_Olhao = 810,

    [Description("Portimão")]
    Faro_Portimao = 811,

    [Description("São Brás de Alportel")]
    Faro_SaoBrasDeAlportel = 812,

    [Description("Silves")]
    Faro_Silves = 813,

    [Description("Tavira")]
    Faro_Tavira = 814,

    [Description("Vila do Bispo")]
    Faro_VilaDoBispo = 815,

    [Description("Vila Real de Santo António")]
    Faro_VilaRealDeSantoAntonio = 816,


    // 09 - GUARDA
    [Description("Aguiar da Beira")]
    Guarda_AguiarDaBeira = 901,

    [Description("Almeida")]
    Guarda_Almeida = 902,

    [Description("Celorico da Beira")]
    Guarda_CeloricoDaBeira = 903,

    [Description("Figueira de Castelo Rodrigo")]
    Guarda_FigueiraDeCasteloRodrigo = 904,

    [Description("Fornos de Algodres")]
    Guarda_FornosDeAlgodres = 905,

    [Description("Gouveia")]
    Guarda_Gouveia = 906,

    [Description("Guarda")]
    Guarda_Guarda = 907,

    [Description("Manteigas")]
    Guarda_Manteigas = 908,

    [Description("Mêda")]
    Guarda_Meda = 909,

    [Description("Pinhel")]
    Guarda_Pinhel = 910,

    [Description("Sabugal")]
    Guarda_Sabugal = 911,

    [Description("Seia")]
    Guarda_Seia = 912,

    [Description("Trancoso")]
    Guarda_Trancoso = 913,

    [Description("Vila Nova de Foz Côa")]
    Guarda_VilaNovaDeFozCoa = 914,


    // 10 - LEIRIA
    [Description("Alcobaça")]
    Leiria_Alcobaca = 1001,

    [Description("Alvaiázere")]
    Leiria_Alvaiazere = 1002,

    [Description("Ansião")]
    Leiria_Ansiao = 1003,

    [Description("Batalha")]
    Leiria_Batalha = 1004,

    [Description("Bombarral")]
    Leiria_Bombarral = 1005,

    [Description("Caldas da Rainha")]
    Leiria_CaldasDaRainha = 1006,

    [Description("Castanheira de Pera")]
    Leiria_CastanheiraDePera = 1007,

    [Description("Figueiró dos Vinhos")]
    Leiria_FigueiroDosVinhos = 1008,

    [Description("Leiria")]
    Leiria_Leiria = 1009,

    [Description("Marinha Grande")]
    Leiria_MarinhaGrande = 1010,

    [Description("Nazaré")]
    Leiria_Nazare = 1011,

    [Description("Óbidos")]
    Leiria_Obidos = 1012,

    [Description("Pedrógão Grande")]
    Leiria_PedrogaoGrande = 1013,

    [Description("Peniche")]
    Leiria_Peniche = 1014,

    [Description("Pombal")]
    Leiria_Pombal = 1015,

    [Description("Porto de Mós")]
    Leiria_PortoDeMos = 1016,


    // 11 - LISBOA
    [Description("Alenquer")]
    Lisboa_Alenquer = 1101,

    [Description("Arruda dos Vinhos")]
    Lisboa_ArrudaDosVinhos = 1102,

    [Description("Azambuja")]
    Lisboa_Azambuja = 1103,

    [Description("Cadaval")]
    Lisboa_Cadaval = 1104,

    [Description("Cascais")]
    Lisboa_Cascais = 1105,

    [Description("Lisboa")]
    Lisboa_Lisboa = 1106,

    [Description("Loures")]
    Lisboa_Loures = 1107,

    [Description("Lourinhã")]
    Lisboa_Lourinha = 1108,

    [Description("Mafra")]
    Lisboa_Mafra = 1109,

    [Description("Oeiras")]
    Lisboa_Oeiras = 1110,

    [Description("Sintra")]
    Lisboa_Sintra = 1111,

    [Description("Sobral de Monte Agraço")]
    Lisboa_SobralDeMonteAgraco = 1112,

    [Description("Torres Vedras")]
    Lisboa_TorresVedras = 1113,

    [Description("Vila Franca de Xira")]
    Lisboa_VilaFrancaDeXira = 1114,

    [Description("Amadora")]
    Lisboa_Amadora = 1115,

    [Description("Odivelas")]
    Lisboa_Odivelas = 1116,


    // 12 - PORTALEGRE
    [Description("Alter do Chão")]
    Portalegre_AlterDoChao = 1201,

    [Description("Arronches")]
    Portalegre_Arronches = 1202,

    [Description("Avis")]
    Portalegre_Avis = 1203,

    [Description("Campo Maior")]
    Portalegre_CampoMaior = 1204,

    [Description("Castelo de Vide")]
    Portalegre_CasteloDeVide = 1205,

    [Description("Crato")]
    Portalegre_Crato = 1206,

    [Description("Elvas")]
    Portalegre_Elvas = 1207,

    [Description("Fronteira")]
    Portalegre_Fronteira = 1208,

    [Description("Gavião")]
    Portalegre_Gaviao = 1209,

    [Description("Marvão")]
    Portalegre_Marvao = 1210,

    [Description("Monforte")]
    Portalegre_Monforte = 1211,

    [Description("Nisa")]
    Portalegre_Nisa = 1212,

    [Description("Ponte de Sor")]
    Portalegre_PonteDeSor = 1213,

    [Description("Portalegre")]
    Portalegre_Portalegre = 1214,

    [Description("Sousel")]
    Portalegre_Sousel = 1215,


    // 13 - PORTO
    [Description("Amarante")]
    Porto_Amarante = 1301,

    [Description("Baião")]
    Porto_Baiao = 1302,

    [Description("Felgueiras")]
    Porto_Felgueiras = 1303,

    [Description("Gondomar")]
    Porto_Gondomar = 1304,

    [Description("Lousada")]
    Porto_Lousada = 1305,

    [Description("Maia")]
    Porto_Maia = 1306,

    [Description("Marco de Canaveses")]
    Porto_MarcoDeCanaveses = 1307,

    [Description("Matosinhos")]
    Porto_Matosinhos = 1308,

    [Description("Paços de Ferreira")]
    Porto_PacosDeFerreira = 1309,

    [Description("Paredes")]
    Porto_Paredes = 1310,

    [Description("Penafiel")]
    Porto_Penafiel = 1311,

    [Description("Porto")]
    Porto_Porto = 1312,

    [Description("Póvoa de Varzim")]
    Porto_PovoaDeVarzim = 1313,

    [Description("Santo Tirso")]
    Porto_SantoTirso = 1314,

    [Description("Valongo")]
    Porto_Valongo = 1315,

    [Description("Vila do Conde")]
    Porto_VilaDoConde = 1316,

    [Description("Vila Nova de Gaia")]
    Porto_VilaNovaDeGaia = 1317,

    [Description("Trofa")]
    Porto_Trofa = 1318,


    // 14 - SANTARÉM
    [Description("Abrantes")]
    Santarem_Abrantes = 1401,

    [Description("Alcanena")]
    Santarem_Alcanena = 1402,

    [Description("Almeirim")]
    Santarem_Almeirim = 1403,

    [Description("Alpiarça")]
    Santarem_Alpiarca = 1404,

    [Description("Benavente")]
    Santarem_Benavente = 1405,

    [Description("Cartaxo")]
    Santarem_Cartaxo = 1406,

    [Description("Chamusca")]
    Santarem_Chamusca = 1407,

    [Description("Constância")]
    Santarem_Constancia = 1408,

    [Description("Coruche")]
    Santarem_Coruche = 1409,

    [Description("Entroncamento")]
    Santarem_Entroncamento = 1410,

    [Description("Ferreira do Zêzere")]
    Santarem_FerreiraDoZezere = 1411,

    [Description("Golegã")]
    Santarem_Golega = 1412,

    [Description("Mação")]
    Santarem_Macao = 1413,

    [Description("Rio Maior")]
    Santarem_RioMaior = 1414,

    [Description("Salvaterra de Magos")]
    Santarem_SalvaterraDeMagos = 1415,

    [Description("Santarém")]
    Santarem_Santarem = 1416,

    [Description("Sardoal")]
    Santarem_Sardoal = 1417,

    [Description("Tomar")]
    Santarem_Tomar = 1418,

    [Description("Torres Novas")]
    Santarem_TorresNovas = 1419,

    [Description("Vila Nova da Barquinha")]
    Santarem_VilaNovaDaBarquinha = 1420,

    [Description("Ourém")]
    Santarem_Ourem = 1421,


    // 15 - SETÚBAL
    [Description("Alcácer do Sal")]
    Setubal_AlcacerDoSal = 1501,

    [Description("Alcochete")]
    Setubal_Alcochete = 1502,

    [Description("Almada")]
    Setubal_Almada = 1503,

    [Description("Barreiro")]
    Setubal_Barreiro = 1504,

    [Description("Grândola")]
    Setubal_Grandola = 1505,

    [Description("Moita")]
    Setubal_Moita = 1506,

    [Description("Montijo")]
    Setubal_Montijo = 1507,

    [Description("Palmela")]
    Setubal_Palmela = 1508,

    [Description("Santiago do Cacém")]
    Setubal_SantiagoDoCacem = 1509,

    [Description("Seixal")]
    Setubal_Seixal = 1510,

    [Description("Sesimbra")]
    Setubal_Sesimbra = 1511,

    [Description("Setúbal")]
    Setubal_Setubal = 1512,

    [Description("Sines")]
    Setubal_Sines = 1513,


    // 16 - VIANA DO CASTELO
    [Description("Arcos de Valdevez")]
    VianaDoCastelo_ArcosDeValdevez = 1601,

    [Description("Caminha")]
    VianaDoCastelo_Caminha = 1602,

    [Description("Melgaço")]
    VianaDoCastelo_Melgaco = 1603,

    [Description("Monção")]
    VianaDoCastelo_Moncao = 1604,

    [Description("Paredes de Coura")]
    VianaDoCastelo_ParedesDeCoura = 1605,

    [Description("Ponte da Barca")]
    VianaDoCastelo_PonteDaBarca = 1606,

    [Description("Ponte de Lima")]
    VianaDoCastelo_PonteDeLima = 1607,

    [Description("Valença")]
    VianaDoCastelo_Valenca = 1608,

    [Description("Viana do Castelo")]
    VianaDoCastelo_VianaDoCastelo = 1609,

    [Description("Vila Nova de Cerveira")]
    VianaDoCastelo_VilaNovaDeCerveira = 1610,


    // 17 - VILA REAL
    [Description("Alijó")]
    VilaReal_Alijo = 1701,

    [Description("Boticas")]
    VilaReal_Boticas = 1702,

    [Description("Chaves")]
    VilaReal_Chaves = 1703,

    [Description("Mesão Frio")]
    VilaReal_MesaoFrio = 1704,

    [Description("Mondim de Basto")]
    VilaReal_MondimDeBasto = 1705,

    [Description("Montalegre")]
    VilaReal_Montalegre = 1706,

    [Description("Murça")]
    VilaReal_Murca = 1707,

    [Description("Peso da Régua")]
    VilaReal_PesoDaRegua = 1708,

    [Description("Ribeira de Pena")]
    VilaReal_RibeiraDePena = 1709,

    [Description("Sabrosa")]
    VilaReal_Sabrosa = 1710,

    [Description("Santa Marta de Penaguião")]
    VilaReal_SantaMartaDePenaguiao = 1711,

    [Description("Valpaços")]
    VilaReal_Valpacos = 1712,

    [Description("Vila Pouca de Aguiar")]
    VilaReal_VilaPoucaDeAguiar = 1713,

    [Description("Vila Real")]
    VilaReal_VilaReal = 1714,


    // 18 - VISEU
    [Description("Armamar")]
    Viseu_Armamar = 1801,

    [Description("Carregal do Sal")]
    Viseu_CarregalDoSal = 1802,

    [Description("Castro Daire")]
    Viseu_CastroDaire = 1803,

    [Description("Cinfães")]
    Viseu_Cinfaes = 1804,

    [Description("Lamego")]
    Viseu_Lamego = 1805,

    [Description("Mangualde")]
    Viseu_Mangualde = 1806,

    [Description("Moimenta da Beira")]
    Viseu_MoimentaDaBeira = 1807,

    [Description("Mortágua")]
    Viseu_Mortagua = 1808,

    [Description("Nelas")]
    Viseu_Nelas = 1809,

    [Description("Oliveira de Frades")]
    Viseu_OliveiraDeFrades = 1810,

    [Description("Penalva do Castelo")]
    Viseu_PenalvaDoCastelo = 1811,

    [Description("Penedono")]
    Viseu_Penedono = 1812,

    [Description("Resende")]
    Viseu_Resende = 1813,

    [Description("Santa Comba Dão")]
    Viseu_SantaCombaDao = 1814,

    [Description("São João da Pesqueira")]
    Viseu_SaoJoaoDaPesqueira = 1815,

    [Description("São Pedro do Sul")]
    Viseu_SaoPedroDoSul = 1816,

    [Description("Sátão")]
    Viseu_Satao = 1817,

    [Description("Sernancelhe")]
    Viseu_Sernancelhe = 1818,

    [Description("Tabuaço")]
    Viseu_Tabuaco = 1819,

    [Description("Tarouca")]
    Viseu_Tarouca = 1820,

    [Description("Tondela")]
    Viseu_Tondela = 1821,

    [Description("Vila Nova de Paiva")]
    Viseu_VilaNovaDePaiva = 1822,

    [Description("Viseu")]
    Viseu_Viseu = 1823,

    [Description("Vouzela")]
    Viseu_Vouzela = 1824,


    // 31 & 32 - R.A. MADEIRA
    [Description("Calheta")]
    Madeira_Calheta = 3101,

    [Description("Câmara de Lobos")]
    Madeira_CamaraDeLobos = 3102,

    [Description("Funchal")]
    Madeira_Funchal = 3103,

    [Description("Machico")]
    Madeira_Machico = 3104,

    [Description("Ponta do Sol")]
    Madeira_PontaDoSol = 3105,

    [Description("Porto Moniz")]
    Madeira_PortoMoniz = 3106,

    [Description("Ribeira Brava")]
    Madeira_RibeiraBrava = 3107,

    [Description("Santa Cruz")]
    Madeira_SantaCruz = 3108,

    [Description("Santana")]
    Madeira_Santana = 3109,

    [Description("São Vicente")]
    Madeira_SaoVicente = 3110,

    [Description("Porto Santo")]
    Madeira_PortoSanto = 3201,


    // 41 to 49 - R.A. AÇORES
    [Description("Vila do Porto")]
    Acores_VilaDoPorto = 4101,

    [Description("Lagoa")]
    Acores_Lagoa = 4201,

    [Description("Nordeste")]
    Acores_Nordeste = 4202,

    [Description("Ponta Delgada")]
    Acores_PontaDelgada = 4203,

    [Description("Povoação")]
    Acores_Povoacao = 4204,

    [Description("Ribeira Grande")]
    Acores_RibeiraGrande = 4205,

    [Description("Vila Franca do Campo")]
    Acores_VilaFrancaDoCampo = 4206,

    [Description("Angra do Heroísmo")]
    Acores_AngraDoHeroismo = 4301,

    [Description("Praia da Vitória")]
    Acores_PraiaDaVitoria = 4302,

    [Description("Santa Cruz da Graciosa")]
    Acores_SantaCruzDaGraciosa = 4401,

    [Description("Calheta de São Jorge")]
    Acores_CalhetaAcores = 4501,

    [Description("Velas")]
    Acores_Velas = 4502,

    [Description("Lajes do Pico")]
    Acores_LajesDoPico = 4601,

    [Description("Madalena")]
    Acores_Madalena = 4602,

    [Description("São Roque do Pico")]
    Acores_SaoRoqueDoPico = 4603,

    [Description("Horta")]
    Acores_Horta = 4701,

    [Description("Lajes das Flores")]
    Acores_LajesDasFlores = 4801,

    [Description("Santa Cruz das Flores")]
    Acores_SantaCruzDasFlores = 4802,

    [Description("Corvo")]
    Acores_Corvo = 4901
}