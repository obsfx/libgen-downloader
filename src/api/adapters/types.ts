export interface KnownSelectors {
  downloadLink: string[];
  resultsTable: string[];
}

export type EntryColumn =
  | "title"
  | "authors"
  | "publisher"
  | "year"
  | "language"
  | "pages"
  | "size"
  | "extension"
  | "mirrors";

export type ColumnMap = Record<EntryColumn, number>;
