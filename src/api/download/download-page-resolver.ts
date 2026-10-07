import { parseHTML } from "linkedom";
import { LIBGEN_PLUS_SELECTORS } from "../adapters/libgen-plus-selectors";
import { RESOLUTION_INTENTS } from "../resolution/intents";
import type { ResolverFactory } from "../resolution/resolver-factory";
import { isBackendOverloadText } from "../availability/utils/failures";
import { DownloadUnavailableError, TransientDownloadError } from "../../errors";
import { pageAlertText } from "./utils/failure-text";

export class DownloadPageResolver {
  constructor(private readonly resolvers: ResolverFactory) {}

  async resolve(page: Response, requestedURL: string, signal: AbortSignal): Promise<Response> {
    const pageURL = page.url || requestedURL;
    const html = await page.text();
    const { document } = parseHTML(html);
    const resolver = this.resolvers.createDownloadLinkResolver(LIBGEN_PLUS_SELECTORS.downloadLink);
    try {
      const outcome = await resolver.resolve({
        task: "download-link",
        scopeKey: new URL(pageURL).host,
        document,
        pageUrl: pageURL,
        intent: RESOLUTION_INTENTS["download-link"],
        signal,
      });
      if (outcome.resolved) {
        return outcome.resolution.payload;
      }
      const alert = pageAlertText(document);
      const lastFailure = outcome.attempts.flatMap((attempt) => attempt.failures).at(-1);
      const detail = alert || lastFailure || "no download link on the page";
      if (isBackendOverloadText(alert)) {
        throw new TransientDownloadError(detail, "backend-overloaded");
      }
      const { failureKind } = outcome;
      if (failureKind === "not-available") {
        throw new DownloadUnavailableError(detail);
      }
      throw new TransientDownloadError(detail, failureKind);
    } finally {
      await resolver.release();
    }
  }
}
