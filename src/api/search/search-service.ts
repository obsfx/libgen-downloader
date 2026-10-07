import type { Adapter } from "../adapters/adapter";
import type { HttpClient } from "../http/http-client";
import { SEARCH_PAGE_SIZE } from "../../settings";
import type { SearchPageResult } from "./types";

export class SearchService {
  constructor(private readonly http: HttpClient) {}

  async fetchPage(
    adapter: Adapter,
    query: string,
    pageNumber: number,
    signal: AbortSignal
  ): Promise<SearchPageResult> {
    const url = adapter.getSearchURL(query, pageNumber, SEARCH_PAGE_SIZE);
    const page = await this.http.fetchDocument(url, { signal });
    const alert = adapter.detectConnectionError(page.document);
    if (alert) {
      return { status: "connection_error", message: alert };
    }
    if (!page.ok) {
      return { status: "connection_error", message: `HTTP ${page.status}` };
    }
    return { status: "loaded", url, document: page.document };
  }
}
