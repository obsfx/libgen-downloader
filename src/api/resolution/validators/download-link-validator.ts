import { classifyFailure, failureKindFromStatus } from "../../availability/utils/failures";
import { responseErrorSummary } from "../../download/utils/failure-text";
import type { HttpClient } from "../../http/http-client";
import type { ResolutionRequest, ValidationResult } from "../types";
import { CandidateValidator } from "./candidate-validator";

export class DownloadLinkValidator extends CandidateValidator<Response> {
  constructor(private readonly http: HttpClient) {
    super();
  }

  async validate(
    element: Element,
    request: ResolutionRequest
  ): Promise<ValidationResult<Response>> {
    const href = element.getAttribute("href");
    if (!href) {
      return this.invalid("anchor has no href");
    }
    let url: string;
    try {
      url = new URL(href, request.pageUrl).toString();
    } catch {
      return this.invalid(`unparseable href ${href}`);
    }
    if (!url.startsWith("http")) {
      return this.invalid(`not an http link ${url}`);
    }

    let response: Response;
    try {
      response = await this.http.request(url, { signal: request.signal });
    } catch (error) {
      return this.invalid(`request failed: ${(error as Error).message}`, classifyFailure(error));
    }
    if (response.ok && response.headers.has("content-disposition")) {
      return { valid: true, payload: response };
    }
    const reason = `not a file response (${response.status}) from ${url}`;
    if (failureKindFromStatus(response.status) === "not-available") {
      await response.body?.cancel();
      return this.invalid(reason);
    }
    const summary = await responseErrorSummary(response);
    return this.invalid(
      [reason, summary].filter(Boolean).join(": "),
      failureKindFromStatus(response.status, summary)
    );
  }
}
