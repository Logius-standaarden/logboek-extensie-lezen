## Technische specificatie

### Overwegingen

Voor het maken van deze specificatie hebben we gekeken naar:
- [De referentie implementatie logboek dataverwerkingen]( https://gitlab.com/digilab.overheid.nl/ecosystem/logboek-dataverwerkingen/ldv-referentie-implementatie)
- [De inzicht API]( https://gitlab.com/digilab.overheid.nl/ecosystem/logboek-dataverwerkingen/logboek-dataverwerkingen/-/blob/main/api/openapi.yaml?ref_type=heads)
- [Opentelemetry Tracing API specificatie](https://opentelemetry.io/docs/specs/otel/trace/api/)

### Use cases

#### Opvragen op basis van traceID
De TraceID wordt voor organisatie overstijgende processen gevuld met de W3C TracecontextID en anders met een interne ID waarmee alle logging die bij één instantie van een proces hoort aan elkaar gerelateerd wordt. Deze usecase gaat ervanuit dat de TraceID bekend is en dat je alle bijbehorende logging op wil vragen.

#### Opvragen op basis van processingActivityID
De processingActivityID wordt gevuld met een verwijzing naar de verwerking (verwerkingsregister bij core standaard of algoritmeregister i.h.g.v. objecten extensie) die uitgevoerd wordt. Je wil dan alle traceIDs terugkrijgen die voor deze verwerking bekend zijn.

#### Batch opvragen op basis van traceID

#### Batch opvragen op basis van processingActivityID

#### Filtering op starttijd/eindtijd
Hierbij wil je filters kunnen toepassen tenminste op dateTime start en/of dateTime einde van de traceID(s)/processingActivityID(s).
 