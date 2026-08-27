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

### Batch bevragingen

Een client heeft vaak meerdere, van elkaar losstaande zoekopdrachten.
Denk aan een lijst met `traceId`s die bij een verwerkingsactiviteit horen, of aan een set betrokkenen waarvoor hetzelfde overzicht opgebouwd moet worden.
Deze stuk voor stuk opvragen leidt tot veel opeenvolgende requests.
De lezen API biedt daarom een batch endpoint waarmee meerdere zoekopdrachten in een aanroep uitgevoerd worden, conform [[?batching-module]].

Het batch endpoint is het pad van de collectie met `/_batch` erachter, en wordt met POST bevraagd:

`POST /data-processing-operations/_batch`

<div class="issue">
  De module Batching is nog niet vastgesteld. Werk de verwijzing en waar nodig de uitwerking bij zodra dat wel het geval is.
</div>

#### Opbouw van een batch request

De body bevat een `requests` array met daarin de afzonderlijke zoekopdrachten.
Elke zoekopdracht bevat een `filter` met dezelfde criteria als een reguliere bevraging van de collectie.
De volgorde van de zoekopdrachten in `requests` is betekenisvol.

Voor elke zoekopdracht in een batch gelden dezelfde eisen als voor een losse bevraging.
Elk `filter` MOET dus tenminste een van de parameters `traceID`, `dpl.core.processingActivityId` of `dpl.core.dataSubjectId` bevatten.
Het meegeven van gedeelde criteria via `context` ontslaat een zoekopdracht daar niet van.
Een batch MOET NIET gebruikt worden om alsnog een ongerichte bevraging te doen.

Aan het aantal zoekopdrachten in een batch zit een maximum.
De server MOET dit maximum bepalen en documenteren.
In de OpenAPI specificatie is 100 opgenomen; deze waarde KAN per implementatie aangepast worden aan de capaciteit van de server.

#### Opbouw van een batch response

De response bevat een `results` array.
Deze bevat exact evenveel elementen als de `requests` array en staat in dezelfde volgorde.
Een client koppelt een resultaat aan een zoekopdracht op basis van de positie in de array; er worden geen correlatie-ids gebruikt.

Elk resultaat is een object met een `items` array met de gevonden dataverwerkingen.
Levert een zoekopdracht geen treffers op, dan is `items` een lege array.
Een resultaat wordt nooit weggelaten, omdat de koppeling op positie dan niet meer klopt.

<p class="note">De module Batching schrijft voor het resultaat van een bevraging van een collectie de naam <code>items</code> voor.
Binnen een batch heet de lijst met dataverwerkingen daarom <code>items</code> en niet <code>dataProcessingOperations</code>, zoals bij een reguliere bevraging het geval is.

Een batch is niet transactioneel.
Wanneer het uitvoeren van een zoekopdracht misgaat, laat dat de overige zoekopdrachten onverlet.

Onderstaand voorbeeld toont een batch met twee zoekopdrachten, met een tijdvenster dat voor beide geldt.
De tweede zoekopdracht levert in dit voorbeeld geen treffers op, en heeft daarom een lege `items` array op dezelfde positie.
De inhoud van de gevonden dataverwerking is ingekort tot de verplichte velden.

```json
{
  "context": { "startTime": "2026-01-01T00:00:00.000Z" },
  "requests": [
    { "filter": { "traceId": "ef4e77b9-b03b-585f-b613-5fcf8d8555fb" } },
    { "filter": { "traceId": "9c1f2a34-5d6e-7f80-9a1b-2c3d4e5f6071" } }
  ]
}
```

```json
{
  "metadata": {
    "logbookId": "be00596a-266d-44b2-81f0-169cc2986435",
    "organizationName": "Gemeente Boerenkoolstronkerade"
  },
  "results": [
    {
      "items": [
        {
          "traceId": "ef4e77b9-b03b-585f-b613-5fcf8d8555fb",
          "spanId": "beb0291b5162d850",
          "status": "Ok",
          "name": "verwerken van gegevens",
          "startTime": "2026-01-02T06:30:00.000Z",
          "endTime": "2026-01-02T06:30:01.000Z"
        }
      ]
    },
    { "items": [] }
  ]
}
```

#### Gedeelde criteria met `context`

Een client KAN criteria die voor alle zoekopdrachten in een batch gelden eenmalig meegeven in een `context` object naast `requests`, in plaats van ze bij elke zoekopdracht te herhalen.
Voor de lezen API gaat het om `startTime` en/of `endTime`.
De criteria uit `context` worden gecombineerd met het `filter` van elke afzonderlijke zoekopdracht.

Wanneer een veld zowel in `context` als in het `filter` van een zoekopdracht voorkomt, MOET de server de hele batch afwijzen met een HTTP 400 Bad Request.
Er wordt bewust geen voorrangsregel toegepast.
Een client zou bij stilzwijgende voorrang resultaten terugkrijgen die bij geen van beide opgegeven criteria passen, zonder dat daar een signaal over gegeven wordt.

#### Foutafhandeling bij batches

De server MOET een batch in zijn geheel afwijzen met een HTTP 400 Bad Request en een `application/problem+json` body wanneer:

- de body niet valide is of niet voldoet aan het schema;
- het aantal zoekopdrachten het maximum van de server overschrijdt;
- het uitvoeren van de batch een response zou opleveren die de limieten van de server overschrijdt;
- een veld zowel in `context` als in een `filter` is opgegeven.

<p class="note">Autorisatie MOET per zoekopdracht in de batch toegepast worden.
Een batch is een verzameling losse bevragingen en geeft een client dus geen toegang tot dataverwerkingen waar deze bij een losse bevraging geen recht op zou hebben.

<div class="issue">
  Werk uit hoe paginering zich verhoudt tot een batch bevraging. De module Batching laat het mechanisme hiervoor open.
</div>

### Beveilingsoverwegingen (Security considerations)

Deze extensie specificeert geen specifieke wijze van authenticatie.
Echter, authenticatie MOET worden ingericht voor een lezen API.
De extensie laat enkel vrij hoe deze authenticatie wordt ingericht.

Authenticatie van een client die een lezen API bevraagd is verplicht. De implementatie van de lezen API richt autorisatie regels in zodat een client alleen toegang krijgt tot loggingregels waar deze recht op heeft.

<p class="note">Het Kennisplatform API's heeft een niet-normatieve module [[?access-control-module]] die hiervoor handvaten biedt.
<p class="note">De <a href="https://gitlab.com/digilab.overheid.nl/ecosystem/logboek-dataverwerkingen/ldv-referentie-implementatie">referentie implementatie</a> van logboek dataverwerkingen geeft een specifiek voorbeeld voor hoe dit gedaan kan worden.
