## Technische specificatie

### Architectuur

Per logboek MOET er een lezen API beschikbaar zijn.
Deze API geeft toegang tot alle dataverwerkingen die in dit logboek zijn opgeslagen.
Indien de verwerkingsactiviteit over meerdere applicaties (met eigen logboeken) gaat, dienen alle lezen APIs bevraagd te worden om een compleet beeld van de verwerkingsactiviteit te krijgen.

De extensie voegt een extra attribuut toe aan dataverwerkingen bovenop de core standaard waarmee een aangeroepen externe organisatie (en bijbehorende lezen API) geidentificeerd kan worden.

Het bevragen van meerdere logboeken middels de lezen API begint meestal bij de applicatie waar de verwerkingsactiviteit gestart is.
Vanuit de daar opgevraagde dataverwerkingen zijn dan de URLs van APIs te vinden die als volgende bevraagd moeten worden om een compleet beeld van de verwerkingsactiviteit te krijgen.
Op deze manier kan iteratief een compleet beeld opgebouwd worden.

### Werking lezen API

De lezen API kent een type resource Dataverwerkingen volgens de core standaard logboek dataverwerkingen oftewel DataProcessingOperations in opentelemetry.
Voor het bevragen van deze resource MOET tenminste een van de volgende parameters meegegeven worden:

- `traceID` (Trace)
- `dpl.core.processingActivityId` (Verwerkingsactiviteit)
- `dpl.core.dataSubjectId` (Betrokkene)

Een request waar alle drie deze parameters missen MOET resulteren in een HTTP 400 Bad Request.

<p class="note">Wanneer geen query paramaters worden meegegeven, dan zou de server alle dataverwerkingen terug moeten geven.
Het risico is dan groot dat zowel client als server dit niet aankunnen, alsmede dat er teveel gegevens worden gedeeld.

Het is AANBEVOLEN een maximum aantal dataverwerkingen per response terug te geven.

<div class="issue">
  Voeg link toe naar Pagination module zodra die is vastgesteld.
</div>

### Toevoeging bij schrijven Logs

De extensie lezen voegt een attribuut toe ten opzichte van de Core standaard.

| Veld                   | Type   | Beschrijving                                                                                                                               |
|------------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------|
| dpl.read.nextLogbookId | String | verwijzing naar de lezen API van de aan te roepen externe applicatie of partij. uri naar uniek identificeerbare API volgens extensie lezen |

Het stelt in staat te verwijzen naar de volgende partij of applicatie in de keten waar verdere logging over een ketenproces te vinden is.
Registreer bij iedere verwerking die een externe partij aanroept de URL van de lezen API waar je de verwerkingen van die partij kan opzoeken.
Indien er geen sprake is van het aanroepen van een andere API of de externe partij heeft geen lezen API beschikbaar voor hun logboek, dan MOET dit attribuut worden weggelaten.
Dit attribuut MOET een specifieke waarde hebben ongeacht het gebruikte detailniveau.

#### Query op basis van `traceId`

Een `traceId` word vastgelegd per logregel volgens [[[trace-context-1]]].
Een query op basis van `traceId` resulteert in alle dataverwerkingen die zijn uitgevoerd voor deze specifieke reeks aan dataverwerkingen en vereist dat de `traceId` gedeeld is met degene die de dataverwerkingen opvraagt.

#### Query op basis van `dpl.core.processingActivityID`

Het attribuut `dpl.core.processingActivityID` wordt gevuld met een verwijzing naar de verwerkingsactiviteit die uitgevoerd wordt.
Een query op basis van `dpl.core.processingActivityID` resulteert in alle dataverwerkingen die zijn uitgevoerd met dit type verwerkingsactiviteit.
Dit vereist dat het register van Verwerkingsactiviteiten beschikbaar is voor degene die de dataverwerkingen opvraagt.

#### Query op basis van `dpl.core.dataSubjectId`

Het attribuut `dpl.core.dataSubjectId` wordt gevuld met een verwijzing naar de betrokkene.
Een query op basis van `dpl.core.dataSubjectId` resulteert in alle dataverwerkingen die zijn uitgevoerd voor de betrokkene.
Dit vereist dat het `dpl.core.dataSubjectIdType` en bijbehorende waarde bekend zijn bij degene die de dataverwerkingen opvraagt.

<p class="note">Houdt rekening met <a href="https://gitdocumentatie.logius.nl/publicatie/logboek/dataverwerkingen/1.0.0/#loggen-van-dataverwerkingen-met-persoonsdata">de eisen van de Core standaard</a> omtrent pseudonimisering

#### Query op basis van `startTime` en/of `endTime`

De `startTime` en `endTime` worden per logregel vastgelegd.
Een query op basis van `startTime` en/of `endTime` resulteert in alle dataverwerkingen die zijn uitgevoerd vanaf, tijdens of uiterlijk tot deze tijdstippen.

<p class="warning">Hier is geen vereiste persoonlijke informatie noodzakelijk om de query op te stellen.
Houdt rekening met de beveiligingsoverwegingen hieronder.

De lezen API voldoet aan de [[[ADR]]], waardoor er een translatie nodig is om de `uint64` representatie van een tijdstip van de Core standaard om te zetten in een waarde die voldoet aan [[RFC3339]].

### Beveilingsoverwegingen (Security considerations)

Deze extensie specificeert geen specifieke wijze van authenticatie.
Echter, authenticatie MOET worden ingericht voor een lezen API.
De extensie laat enkel vrij hoe deze authenticatie wordt ingericht.

Authenticatie van een client die een lezen API bevraagd is verplicht en richt autorisatie regels in zodat een client alleen toegang krijgt tot loggingregels waar deze recht op heeft.

<p class="note">Het Kennisplatform API's heeft een niet-normatieve module [[?access-control-module]] die hiervoor handvaten biedt.
<p class="note">De <a href="https://gitlab.com/digilab.overheid.nl/ecosystem/logboek-dataverwerkingen/ldv-referentie-implementatie">referentie implementatie</a> van logboek dataverwerkingen geeft een specifiek voorbeeld voor hoe dit gedaan kan worden.

<div class="issue">
  Voeg link toe naar Batching module zodra die is vastgesteld.
</div>
