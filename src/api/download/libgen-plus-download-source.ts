import type { LibgenPlusAdapter } from "../adapters/libgen-plus-adapter";
import type { HttpClient } from "../http/http-client";
import type { DownloadPageResolver } from "./download-page-resolver";
import { DownloadSource } from "./download-source";

export class LibgenPlusDownloadSource extends DownloadSource {
  readonly name: string;

  constructor(
    private readonly adapter: LibgenPlusAdapter,
    private readonly http: HttpClient,
    pageResolver: DownloadPageResolver
  ) {
    super(pageResolver);
    this.name = adapter.scopeKey;
  }

  async open(md5: string, signal: AbortSignal): Promise<Response> {
    const pageURL = this.adapter.getDetailPageURL(md5);
    const page = await this.http.request(pageURL, { signal });
    return this.followToFile(page, pageURL, signal);
  }
}
