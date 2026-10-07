import type { HttpClient } from "../http/http-client";
import { AnchorCandidateExtractor } from "./candidates/anchor-candidate-extractor";
import type { CandidateExtractor } from "./candidates/candidate-extractor";
import { TableCandidateExtractor } from "./candidates/table-candidate-extractor";
import type { CrossEncoderModel } from "./model/cross-encoder-model";
import type { CandidateRanker } from "./rankers/candidate-ranker";
import { CrossEncoderRanker } from "./rankers/cross-encoder-ranker";
import { DownloadLinkHeuristicRanker } from "./rankers/download-link-heuristic-ranker";
import { ResultsTableHeuristicRanker } from "./rankers/results-table-heuristic-ranker";
import type { ResolutionStage } from "./resolution-stage";
import { SelectorResolver } from "./selector-resolver";
import { KnownSelectorStage } from "./stages/known-selector-stage";
import { LearnedSelectorStage } from "./stages/learned-selector-stage";
import { RankedCandidateStage } from "./stages/ranked-candidate-stage";
import type { SelectorStore } from "./store/selector-store";
import type { CandidateValidator } from "./validators/candidate-validator";
import { DownloadLinkValidator } from "./validators/download-link-validator";
import { ResultsTableValidator } from "./validators/results-table-validator";
import { RANKED_TOP_K } from "./settings";

export class ResolverFactory {
  constructor(
    private readonly http: HttpClient,
    private readonly store: SelectorStore,
    private readonly crossEncoder?: CrossEncoderModel
  ) {}

  createDownloadLinkResolver(knownSelectors: string[]): SelectorResolver<Response> {
    return this.createResolver(
      knownSelectors,
      new AnchorCandidateExtractor(),
      new DownloadLinkHeuristicRanker(),
      new DownloadLinkValidator(this.http)
    );
  }

  createResultsTableResolver(knownSelectors: string[]): SelectorResolver<Element> {
    return this.createResolver(
      knownSelectors,
      new TableCandidateExtractor(),
      new ResultsTableHeuristicRanker(),
      new ResultsTableValidator()
    );
  }

  private createResolver<TPayload>(
    knownSelectors: string[],
    extractor: CandidateExtractor,
    heuristic: CandidateRanker,
    validator: CandidateValidator<TPayload>
  ): SelectorResolver<TPayload> {
    const stages: ResolutionStage[] = [
      new KnownSelectorStage(knownSelectors),
      new LearnedSelectorStage(this.store),
      new RankedCandidateStage(extractor, heuristic, RANKED_TOP_K),
    ];
    if (this.crossEncoder) {
      stages.push(
        new RankedCandidateStage(extractor, new CrossEncoderRanker(this.crossEncoder), RANKED_TOP_K)
      );
    }
    return new SelectorResolver(stages, validator, this.store);
  }
}
