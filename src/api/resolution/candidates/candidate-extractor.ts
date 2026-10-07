import type { Candidate, ResolutionRequest } from "../types";

export abstract class CandidateExtractor {
  protected abstract readonly selector: string;
  protected abstract describe(element: Element): string;

  extract(request: ResolutionRequest): Candidate[] {
    return [...request.document.querySelectorAll(this.selector)].map((element) => {
      return { element, description: this.describe(element) };
    });
  }

  protected normalizedText(element: Element, limit: number): string {
    return (element.textContent ?? "").replaceAll(/\s+/g, " ").trim().slice(0, limit);
  }
}
