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

De extensie voegt een extra veld toe aan dataverwerkingen bovenop de core standaard waarmee een aangeroepen externe organisatie(en bijbehorende lezen API) geidentificeerd kan worden.

Begin bij het bevragen van de lezen APIs altijd bij de organisatie waarde verwerkingsactiviteit gestart is. Vanuit de daar opgevraagde dataverwerkingen zijn dan de URLs van APIs te vinden die als volgende bevraagd moeten worden om een compleet beeld van de verwerkingsactiviteit te krijgen. Op deze manier kan iteratief een compleet beeld opgebouwd worden.

### Werking lezen API

De lezen API kent één type resource Dataverwerkingen volgens de core standaard logboek dataverwerkingen oftewel ProcessingActivities in opentelemetry. Voor het bevragen van deze resource moet tenminste een van de volgende query parameters toegepast worden:

- traceID (Trace)
- dpl.core.processingActivityID (Verwerkingsactiviteit)
- dataSubjectId (Betrokkene)

Wanneer dit bij een request aan de server niet gebeurd geeft de server een http 400 bad request melding terug die aangeeft dat hieraan niet voldaan is.

overweging: wanneer geen query paramaters worden toegepast geeft de server alle dataverwerkingen terug. Het risico is dan groot dat zowel client als server dit niet aankunnen.

aanbeveling: Het is verstandig als de server ook bij het toepassen van query parameters een maximum stelt aan het aantal terug te geven dataverwerkingen.

### Toevoeging bij schrijven Logs

registreer bij iedere verwerking die een externe partij aanroept de URL van de API waar je de verwerkingen van die partij kan opzoeken.

#### Query op basis van traceID

De TraceID wordt voor organisatie overstijgende processen gevuld met de W3C TracecontextID en anders met een interne ID waarmee alle logging die bij één instantie van een proces hoort aan elkaar gerelateerd wordt. Deze usecase gaat ervanuit dat de TraceID bekend is en dat je alle bijbehorende logging op wil vragen.

#### Query op basis van processingActivityID

De processingActivityID wordt gevuld met een verwijzing naar de verwerking (verwerkingsregister bij core standaard of algoritmeregister i.h.g.v. objecten extensie) die uitgevoerd wordt. Je wil dan alle traceIDs terugkrijgen die voor deze verwerking bekend zijn.

#### Query op basis van dataSubjectId

De processingActivityID wordt gevuld met een verwijzing naar de verwerking (verwerkingsregister bij core standaard of algoritmeregister i.h.g.v. objecten extensie) die uitgevoerd wordt. Je wil dan alle traceIDs terugkrijgen die voor deze verwerking bekend zijn.

#### Query op starttijd/eindtijd

Hierbij wil je filters kunnen toepassen tenminste op start_time en/of end_time einde van de dataverwerkingen.

### Todo

- Pagination toevoegen
- Na publicatie logboek dataverwerkingen core, verwijzingen naar begrippen in json schema aanpassen
- Batch bevragingen mogelijk maken voor meerdere processingActivityIds/TraceIds/dataSubjectIds volgens Batching module ADR
- Uitwerken hoe lezen uit te breiden voor objecten. Is dit een uitbreiding op de extensie lezen of op de extensie objecten?
- Foutmelding definieren voor wanneer het maximum aantal terug te geven dataverwerkingen van de server door een request overschreden wordt
- iets over beveiliging/autorisatie zeggen, security considerations?
- Aanbeveling wat te doen als niet alle organisaties de lezen API implementeren
- Verwijzen naar beleidsjuridischkader voor inrichting samenwerking tussen organisaties
