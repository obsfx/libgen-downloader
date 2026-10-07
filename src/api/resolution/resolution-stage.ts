import type { ResolutionRequest, ResolutionStageName } from "./types";

export abstract class ResolutionStage {
  abstract readonly name: ResolutionStageName;
  readonly speculative: boolean = false;
  abstract propose(request: ResolutionRequest): Promise<Element[]>;

  async release(): Promise<void> {}
}
