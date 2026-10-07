import { parseHTML } from "linkedom";
import { DocumentFetchError, HttpStatusError } from "../../errors";
import type { FetchedDocument, HttpRequestOptions } from "./types";

export abstract class HttpClient {
  abstract request(url: string, options: HttpRequestOptions): Promise<Response>;

  async json<T>(url: string, options: HttpRequestOptions): Promise<T> {
    const response = await this.request(url, options);
    if (!response.ok) {
      await response.body?.cancel();
      throw new HttpStatusError(response.status, url);
    }
    return (await response.json()) as T;
  }

  async fetchDocument(url: string, options: HttpRequestOptions): Promise<FetchedDocument> {
    try {
      const response = await this.request(url, options);
      const html = await response.text();
      const { document } = parseHTML(html);
      return { document, ok: response.ok, status: response.status };
    } catch {
      throw new DocumentFetchError(url);
    }
  }
}
