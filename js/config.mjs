import { loadRespecWithConfiguration } from "https://logius-standaarden.github.io/publicatie/respec/organisation-config.mjs";

loadRespecWithConfiguration({
  useLogo: true,
  useLabel: true,
  maxTocLevel: 3,
  license: "cc-by",
  specStatus: "WV",
  specType: "PR",
  pubDomain: "logboek",
  shortName: "logboek-extensie-template",
  publishDate: "2025-03-31",
  publishVersion: "0.9",
  prevVersion: [],

  editors:
    [
      {
        name: "Nil Barua",
        company: "Logius",
        companyURL: "https://logius.nl",
      },
      {
        name: "Tim van der Lippe",
        company: "Logius",
        companyURL: "https://logius.nl",
      },
    ],
  authors:
    [
      {
        name: "Nil Barua",
        company: "Logius",
        companyURL: "https://logius.nl",
      },
      {
        name: "Tim van der Lippe",
        company: "Logius",
        companyURL: "https://logius.nl",
      },
    ],
  github: "https://github.com/Logius-standaarden/logboek-extensie-template",
});
