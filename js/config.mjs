import { loadRespecWithConfiguration } from "https://logius-standaarden.github.io/publicatie/respec/organisation-config.mjs";

loadRespecWithConfiguration({
  useLogo: true,
  useLabel: true,
  maxTocLevel: 2,
  license: "cc-by",
  specStatus: "WV",
  specType: "PR",
  pubDomain: "logboek",
  shortName: "logboek-extensie-lezen",
  publishDate: "2025-11-26",
  publishVersion: "0.9",
  // TODO: Verwijder voor publicatie
  latestVersion: "https://logius-standaarden.github.io/logboek-extensie-lezen/",
  prevVersion: [],

  editors:
    [
      {
        name: "Nil Barua",
        company: "Logius",
        companyURL: "https://www.logius.nl",
      },
      {
        name: "Tim van der Lippe",
        company: "Logius",
        companyURL: "https://www.logius.nl",
      },
    ],
  authors:
    [
      {
        name: "Frank Terpstra",
        company: "Geonovum",
        companyURL: "https://www.geonovum.nl",
      },
      {
        name: "Tim van der Lippe",
        company: "Logius",
        companyURL: "https://www.logius.nl",
      },
      {
        name: "Henk Erik van der Hoek",
        company: "Geonovum",
        companyURL: "https://www.geonovum.nl",
      },
    ],
  postProcess: [
    async (config, document) => {
      const codeElement = document.querySelector('.openapi-spec code');
      const openapiResponse = await fetch('media/openapi.json');
      codeElement.innerText = await openapiResponse.text();
    }
  ],
  github: "https://github.com/Logius-standaarden/logboek-extensie-lezen",
});
