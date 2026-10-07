import type { CrossEncoderModel } from "../model/cross-encoder-model";
import type { Candidate, ResolutionRequest } from "../types";
import { CandidateRanker } from "./candidate-ranker";

export class CrossEncoderRanker extends CandidateRanker {
  constructor(private readonly model: CrossEncoderModel) {
    super();
  }

  async rank(request: ResolutionRequest, candidates: Candidate[]): Promise<Candidate[]> {
    const scores = await this.model.score(
      request.intent,
      candidates.map((candidate) => candidate.description),
      request.signal
    );
    return candidates
      .map((candidate, index) => ({ candidate, score: scores[index] }))
      .toSorted((a, b) => b.score - a.score)
      .map(({ candidate }) => candidate);
  }

  async release(): Promise<void> {
    await this.model.release();
  }
}
