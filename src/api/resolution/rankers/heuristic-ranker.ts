import type { Candidate, ResolutionRequest } from "../types";
import { CandidateRanker } from "./candidate-ranker";

export abstract class HeuristicRanker extends CandidateRanker {
  protected abstract score(candidate: Candidate): number;

  async rank(_request: ResolutionRequest, candidates: Candidate[]): Promise<Candidate[]> {
    return candidates
      .map((candidate) => ({ candidate, score: this.score(candidate) }))
      .filter(({ score }) => score > 0)
      .toSorted((a, b) => b.score - a.score)
      .map(({ candidate }) => candidate);
  }
}
