import type { KnownSelectors } from "./types";

export const LIBGEN_PLUS_SELECTORS: KnownSelectors = {
  downloadLink: ["#main > tr:first-child > td:nth-child(2) > a"],
  resultsTable: ["#tablelibgen"],
};

export const LIBGEN_PLUS_CONNECTION_ERROR_SELECTOR = ".alert-danger";
