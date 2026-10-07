import { ResolutionStage } from "../resolution-stage";
import type { SelectorStore } from "../store/selector-store";
import type { ResolutionRequest } from "../types";
import { resolvePath } from "../utils/dom-path";

export class LearnedSelectorStage extends ResolutionStage {
  readonly name = "learned";

  constructor(private readonly store: SelectorStore) {
    super();
  }

  async propose(request: ResolutionRequest): Promise<Element[]> {
    const learned = await this.store.get(request.scopeKey, request.task);
    if (!learned) {
      return [];
    }
    const element = resolvePath(request.document.documentElement, learned.path);
    if (!element) {
      return [];
    }
    return [element];
  }
}
