import type { FailureKind } from "../availability/types";
import type { ResolutionStage } from "./resolution-stage";
import type { SelectorStore } from "./store/selector-store";
import type {
  ResolutionAttempt,
  ResolutionOutcome,
  ResolutionRequest,
  ResolutionStageName,
} from "./types";
import { pathFrom } from "./utils/dom-path";
import type { CandidateValidator } from "./validators/candidate-validator";

export class SelectorResolver<TPayload> {
  constructor(
    private readonly stages: ResolutionStage[],
    private readonly validator: CandidateValidator<TPayload>,
    private readonly store: SelectorStore
  ) {}

  async resolve(request: ResolutionRequest): Promise<ResolutionOutcome<TPayload>> {
    const attempts: ResolutionAttempt[] = [];
    const checked = new Set<Element>();
    let failureKind: FailureKind = "not-available";

    for (const stage of this.stages) {
      const proposed = await stage.propose(request);
      const proposals = proposed.filter((element) => !checked.has(element));
      const attempt: ResolutionAttempt = {
        stage: stage.name,
        proposals: proposals.length,
        failures: [],
      };
      attempts.push(attempt);

      for (const element of proposals) {
        checked.add(element);
        const validation = await this.validator.validate(element, request);
        if (validation.valid) {
          await this.remember(stage.name, element, request);
          return {
            resolved: true,
            resolution: { element, payload: validation.payload, stage: stage.name },
            attempts,
          };
        }
        attempt.failures.push(validation.reason);
        if (validation.kind !== "not-available") {
          failureKind = validation.kind;
          if (!stage.speculative) {
            return { resolved: false, attempts, failureKind };
          }
        }
      }

      if (stage.name === "learned" && proposals.length > 0) {
        await this.store.delete(request.scopeKey, request.task);
      }
    }

    return { resolved: false, attempts, failureKind };
  }

  async release(): Promise<void> {
    await Promise.all(this.stages.map((stage) => stage.release()));
  }

  private async remember(
    stageName: ResolutionStageName,
    element: Element,
    request: ResolutionRequest
  ): Promise<void> {
    if (stageName !== "ranked") {
      return;
    }
    await this.store.set(request.scopeKey, request.task, {
      path: pathFrom(request.document.documentElement, element),
      learnedAt: new Date().toISOString(),
    });
  }
}
