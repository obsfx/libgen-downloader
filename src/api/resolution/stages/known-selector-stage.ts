import { ResolutionStage } from "../resolution-stage";
import type { ResolutionRequest } from "../types";

export class KnownSelectorStage extends ResolutionStage {
  readonly name = "known";

  constructor(private readonly selectors: string[]) {
    super();
  }

  async propose(request: ResolutionRequest): Promise<Element[]> {
    return this.selectors.flatMap((selector) => {
      const element = request.document.querySelector(selector);
      if (!element) {
        return [];
      }
      return [element];
    });
  }
}
