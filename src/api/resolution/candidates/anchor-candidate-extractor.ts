import type { Candidate, ResolutionRequest } from "../types";
import { CandidateExtractor } from "./candidate-extractor";
import {
  DESCRIBED_MD5_PATTERN,
  MAX_DESCRIBED_HREF_LENGTH,
  MAX_DESCRIBED_TEXT_LENGTH,
  NON_NAVIGABLE_HREF,
} from "../settings";

export class AnchorCandidateExtractor extends CandidateExtractor {
  protected readonly selector = "a[href]";

  extract(request: ResolutionRequest): Candidate[] {
    return super.extract(request).filter(({ element }) => {
      return !NON_NAVIGABLE_HREF.test(element.getAttribute("href") ?? "");
    });
  }

  protected describe(anchor: Element): string {
    const href = this.shortenHref(anchor.getAttribute("href") ?? "");
    return `<a href="${href}"> text="${this.normalizedText(anchor, MAX_DESCRIBED_TEXT_LENGTH)}"`;
  }

  private shortenHref(href: string): string {
    return href
      .replaceAll(DESCRIBED_MD5_PATTERN, (md5) => {
        return `${md5.slice(0, 6)}...`;
      })
      .slice(0, MAX_DESCRIBED_HREF_LENGTH);
  }
}
