import type { CandidateExtractor } from "../candidates/candidate-extractor";
import type { CandidateRanker } from "../rankers/candidate-ranker";
import { ResolutionStage } from "../resolution-stage";
import type { ResolutionRequest } from "../types";

export class RankedCandidateStage extends ResolutionStage {
  readonly name = "ranked";
  readonly speculative = true;

  constructor(
    private readonly extractor: CandidateExtractor,
    private readonly ranker: CandidateRanker,
    private readonly topK: number
  ) {
    super();
  }

  async propose(request: ResolutionRequest): Promise<Element[]> {
    const candidates = this.extractor.extract(request);
    if (candidates.length === 0) {
      return [];
    }
    const ranked = await this.ranker.rank(request, candidates);
    return ranked.slice(0, this.topK).map((candidate) => candidate.element);
  }

  async release(): Promise<void> {
    await this.ranker.release();
  }
}
