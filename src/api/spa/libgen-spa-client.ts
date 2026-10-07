import type { HttpClient } from "../http/http-client";
import type { SpaDecryptedLink, SpaDownloadLinks, SpaEnvelope } from "./types";
import { SPA_LINK_TOKEN_PARAMETER } from "../../settings";

export class LibgenSpaClient {
  constructor(
    private readonly origin: string,
    private readonly http: HttpClient
  ) {}

  async downloadLinks(bookId: string, signal: AbortSignal): Promise<string[]> {
    const url = new URL("/api/download/links-by-id", this.origin);
    url.searchParams.set("id", bookId);
    const envelope = await this.http.json<SpaEnvelope<SpaDownloadLinks>>(url.toString(), {
      signal,
    });
    if (envelope.isError) {
      return [];
    }
    return envelope.result.links;
  }

  async fileURL(link: string, signal: AbortSignal): Promise<string | undefined> {
    const linkURL = URL.parse(link);
    const token = linkURL?.searchParams.get(SPA_LINK_TOKEN_PARAMETER);
    if (!linkURL || !token) {
      return undefined;
    }
    const decryptURL = new URL("/api/decrypt", linkURL.origin);
    decryptURL.searchParams.set(SPA_LINK_TOKEN_PARAMETER, token);
    const decrypted = await this.http.json<SpaDecryptedLink>(decryptURL.toString(), {
      signal,
      method: "POST",
    });
    return new URL(decrypted.downloadLink, linkURL.origin).toString();
  }
}
