import type { Entry } from "../models/entry";

export interface SearchSuccess {
  status: "success";
  entries: Entry[];
}

export interface SearchConnectionFailure {
  status: "connection_error";
  message: string;
}

export interface SearchRequestFailure {
  status: "error";
  message: string;
}

export type SearchFailure = SearchConnectionFailure | SearchRequestFailure;

export type SearchResult = SearchSuccess | SearchFailure;

export interface SearchPageLoaded {
  status: "loaded";
  url: string;
  document: Document;
}

export type SearchPageResult = SearchPageLoaded | SearchConnectionFailure;
