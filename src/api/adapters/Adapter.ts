import { Entry } from "../models/Entry";

export abstract class Adapter {
  abstract baseURL: string;

  abstract isHiddenField(fieldName: string): boolean;
  abstract parseEntries(
    document: Document,
    throwError?: (message: string) => void
  ): Entry[] | undefined;
  abstract getPageURL(pathname: string): string;
  abstract getSearchURL(query: string, pageNumber: number, pageSize: number): string;
  abstract getDetailPageURL(md5: string): string;
  abstract getMainDownloadURLFromDocument(
    document: Document,
    throwError?: (message: string) => void
  ): string | null;
  abstract formatField(fieldName: string, value: string): string;
}
