import type { HttpClient } from "../http/http-client";
import type { LibgenSpaClient } from "../spa/libgen-spa-client";
import type { DownloadPageResolver } from "./download-page-resolver";
import { DownloadSource } from "./download-source";
import { classifyFailure } from "../availability/utils/failures";
import { DownloadUnavailableError, TransientDownloadError } from "../../errors";

export class LibgenSpaDownloadSource extends DownloadSource {
  readonly name: string;

  constructor(
    origin: string,
    private readonly client: LibgenSpaClient,
    private readonly http: HttpClient,
    pageResolver: DownloadPageResolver
  ) {
    super(pageResolver);
    this.name = new URL(origin).host;
  }

  async open(md5: string, signal: AbortSignal): Promise<Response> {
    const links = await this.client.downloadLinks(md5, signal);
    if (links.length === 0) {
      throw new DownloadUnavailableError("not in this mirror's catalogue");
    }
    let lastError: Error = new DownloadUnavailableError("no download links");
    let transientError: Error | undefined;
    for (const link of links) {
      try {
        return await this.openLink(link, signal);
      } catch (error) {
        lastError = error as Error;
        if (!transientError && !(error instanceof DownloadUnavailableError)) {
          transientError = lastError;
        }
      }
    }
    throw transientError ?? lastError;
  }

  private async openLink(link: string, signal: AbortSignal): Promise<Response> {
    let fileURL: string | undefined;
    try {
      fileURL = await this.client.fileURL(link, signal);
    } catch (error) {
      let kind = classifyFailure(error);
      if (kind === "not-available") {
        kind = "server-error";
      }
      throw new TransientDownloadError(`link decryption failed: ${(error as Error).message}`, kind);
    }
    if (!fileURL) {
      throw new DownloadUnavailableError(`unsupported link ${new URL(link).host}`);
    }
    const response = await this.http.request(fileURL, { signal });
    return this.followToFile(response, fileURL, signal);
  }
}
