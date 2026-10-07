import { Entry } from "../models/entry";

export abstract class Adapter {
  abstract baseURL: string;

  abstract isHiddenField(fieldName: string): boolean;
  abstract resolveEntries(
    document: Document,
    pageURL: string,
    signal: AbortSignal
  ): Promise<Entry[]>;
  abstract getSearchURL(query: string, pageNumber: number, pageSize: number): string;
  abstract getEntryMD5(entry: Entry): string | undefined;
  abstract formatField(fieldName: string, value: string): string;
  abstract detectConnectionError(document: Document): string | undefined;
}
