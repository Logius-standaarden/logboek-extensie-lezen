## Technische specificatie

### Overwegingen

Voor het maken van deze specificatie hebben we gekeken naar:

- [De referentie implementatie logboek dataverwerkingen]( https://gitlab.com/digilab.overheid.nl/ecosystem/logboek-dataverwerkingen/ldv-referentie-implementatie)
- [De inzicht API]( https://gitlab.com/digilab.overheid.nl/ecosystem/logboek-dataverwerkingen/logboek-dataverwerkingen/-/blob/main/api/openapi.yaml?ref_type=heads)
- [Opentelemetry Tracing API specificatie](https://opentelemetry.io/docs/specs/otel/trace/api/)
- [De standaard logboek dataverwerkingen](https://logius-standaarden.github.io/logboek-dataverwerkingen/)
- [De extensie objecten](https://logius-standaarden.github.io/logboek-extensie-object/)

### Architectuur

Per logboek is kan er één lezen API geimplementeerd worden. Deze geeft toegang tot alle dataverwerkingen die in dit logboek zijn opgeslagen. Indien de verwerkingsactiviteit over meerdere applicaties (met eigen logboeken) gaat, dienen alle lezen APIs bevraagd te worden om een compleet beeld van de verwerkingsactiviteit te krijgen.
Wanneer er binnen één organisatie meerdere logboeken zijn dan moeten deze vanuit oogpunt van de lezen extensie gezien worden als aparte applicaties en voor elk logboek de lezen API implementeren.

De extensie voegt een extra attribuut toe aan dataverwerkingen bovenop de core standaard waarmee een aangeroepen externe organisatie (en bijbehorende lezen API) geidentificeerd kan worden.

Begin bij het bevragen van de lezen APIs altijd bij de applicatie waar de verwerkingsactiviteit gestart is. Vanuit de daar opgevraagde dataverwerkingen zijn dan de URLs van APIs te vinden die als volgende bevraagd moeten worden om een compleet beeld van de verwerkingsactiviteit te krijgen. Op deze manier kan iteratief een compleet beeld opgebouwd worden.

### Werking lezen API

De lezen API kent één type resource Dataverwerkingen volgens de core standaard logboek dataverwerkingen oftewel ProcessingActivities in opentelemetry. Voor het bevragen van deze resource MOET tenminste een van de volgende parameters meegegeven worden:

- traceID (Trace)
- dpl.core.processingActivityID (Verwerkingsactiviteit)
- dataSubjectId (Betrokkene)

Wanneer dit bij een request aan de server niet gebeurd, MOET de server antwoorden met een HTTP 400 Bad Request, die aangeeft dat hieraan niet voldaan is.

<p class="note">Wanneer geen query paramaters worden meegegeven, dan zou de server alle dataverwerkingen terug moeten geven. Het risico is dan groot dat zowel client als server dit niet aankunnen, alsmede dat er teveel gegevens worden gedeeld.

aanbeveling: Het is verstandig als de server ook bij het toepassen van query parameters een maximum stelt aan het aantal terug te geven dataverwerkingen.

### Toevoeging bij schrijven Logs

De lezen extensie voegt één attribuut toe ten opzichte van de Core standaard. Deze is alleen nodig als een implementerende applicatie onderdeel is van een keten waarin meerdere loggende applicaties zijn. Het stelt in staat te verwijzen naar de volgende partij of applicatie in de keten waar verdere logging over een ketenproces te vinden is. Registreer bij iedere verwerking die een externe partij aanroept de URL van de API waar je de verwerkingen van die partij kan opzoeken. Indien er geen sprake is van een keten of een de implementerende applicatie de laatste schakel in de keten is dan hoeft dit attribuut niet geschreven te worden. Wanneer er wel een volgende partij is maar deze de lezen extensie (nog) niet implmenteerd kan je in dit attribuut een URL die verwijst naar een pagina met contactgegevens opnemen. Dit attribuut is van Niveau 1 dat wil zeggen dat het bij ieder detail niveau van logging opgenomen kan worden.


| attribute                   | Niveau | beschrijving                                                                                                                               |
|-----------------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------|
| dpl.read.externalReadAPI_id | 1      | verwijzing naar de lezen API van de aan te roepen externe applicatie of partij. uri naar uniek identificeerbare API volgens lezen extensie |

#### Query op basis van traceID

De TraceID wordt voor organisatie overstijgende processen gevuld met de W3C TracecontextID en anders met een interne ID waarmee alle logging die bij één instantie van een proces hoort aan elkaar gerelateerd wordt. Deze usecase gaat ervanuit dat de TraceID bekend is en dat je alle bijbehorende logging op wil vragen.

#### Query op basis van processingActivityID

De processingActivityID wordt gevuld met een verwijzing naar de verwerkingsactiviteit (verwerkingsregister bij core standaard of algoritmeregister i.h.g.v. objecten extensie) die uitgevoerd wordt. Je wil dan alle traceIDs terugkrijgen die voor deze verwerkingsactiviteit bekend zijn.

#### Query op basis van dataSubjectId

De dataSubjectId gevuld met een verwijzing naar de betrokkene van verwerkingen. Je wil dan alle traceIDs terugkrijgen die voor deze betrokkene bekend zijn. Het is hierbij aan te bevelen het gebruik van BSN en andere gevoelige personsgegevens in de logging te vermijden. Het waar mogelijk toepassen van pseudoniemen verminderd de kans op datalekken.

#### Query op starttijd/eindtijd

Hierbij wil je filters kunnen toepassen tenminste op start_time en/of end_time einde van de dataverwerkingen. We kiezen ervoor om in de interface de REST API Designrules te volgen voor het aangeven van tijd. Deze kent andere conventies dan Open Telemetry waarin tijdstippen volgens de core standaard van logboek dataverwerkingen wordt vastgelegd. De implementatie van de lezen API zal dus een vertaling moeten maken van het OTLP formaat naar het ADR formaat.

### Beveilingsoverwegingen (Security considerations)

In de OAS specificatie staat geen authenticatie voor de leze API gespecificeerd. Dit is bewust niet normatief neergezet om per implementatie de vrijheid te hebben dit binnen het domein waarin de standaard wordt geimplementeerd open te laten. Het is echter wel belangrijk om het endpoint goed te beveiligen. Dus zorg tenminste voor authenticatie van de client die de lezen API bevraagd en richt autorisatie regels in zodat een client alleen toegang krijgt tot loggingregels waar deze recht op heeft. In zijn algemeenheid biedt de module access control van het kennisplatform APIs hier goede handvaten voor. De referentie-implementatie van logboek dataverwerkingen geeft een specifiek voorbeeld voor hoe dit gedaan kan worden.

### Todo

- Pagination toevoegen
- Na publicatie logboek dataverwerkingen core, verwijzingen naar begrippen in json schema aanpassen
- Batch bevragingen mogelijk maken voor meerdere processingActivityIds/TraceIds/dataSubjectIds volgens Batching module ADR
- Uitwerken hoe lezen uit te breiden voor objecten. Is dit een uitbreiding op de extensie lezen of op de extensie objecten?
- Foutmelding definieren voor wanneer het maximum aantal terug te geven dataverwerkingen van de server door een request overschreden wordt
- iets over beveiliging/autorisatie zeggen, security considerations?
- Aanbeveling wat te doen als niet alle organisaties de lezen API implementeren
- Verwijzen naar beleidsjuridischkader voor inrichting samenwerking tussen organisaties
