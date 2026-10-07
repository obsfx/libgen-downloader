import type { DownloadPageResolver } from "./download-page-resolver";
import { failureKindFromStatus } from "../availability/utils/failures";
import { DownloadUnavailableError, TransientDownloadError } from "../../errors";
import { responseErrorSummary } from "./utils/failure-text";
import { TEXT_CONTENT_TYPE } from "../../settings";

export abstract class DownloadSource {
  abstract readonly name: string;

  constructor(protected readonly pageResolver: DownloadPageResolver) {}

  abstract open(md5: string, signal: AbortSignal): Promise<Response>;

  protected isFileResponse(response: Response): boolean {
    return response.ok && response.headers.has("content-disposition");
  }

  protected async followToFile(
    response: Response,
    requestedURL: string,
    signal: AbortSignal
  ): Promise<Response> {
    if (this.isFileResponse(response)) {
      return response;
    }
    if (response.ok && TEXT_CONTENT_TYPE.test(response.headers.get("content-type") ?? "text/")) {
      return this.pageResolver.resolve(response, requestedURL, signal);
    }
    const summary = await responseErrorSummary(response);
    const reason = [`HTTP ${response.status}`, summary].filter(Boolean).join(": ");
    const kind = failureKindFromStatus(response.status, summary);
    if (kind === "not-available") {
      throw new DownloadUnavailableError(reason);
    }
    throw new TransientDownloadError(reason, kind);
  }
}
