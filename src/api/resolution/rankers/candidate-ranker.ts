import type { Candidate, ResolutionRequest } from "../types";

export abstract class CandidateRanker {
  abstract rank(request: ResolutionRequest, candidates: Candidate[]): Promise<Candidate[]>;

  async release(): Promise<void> {}
}
