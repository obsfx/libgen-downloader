import type { FailureKind } from "../availability/types";

export type ResolutionTask = "download-link" | "results-table";

export type ResolutionStageName = "known" | "learned" | "ranked";

export interface PathStep {
  tag: string;
  nth: number;
}

export interface LearnedSelector {
  path: PathStep[];
  learnedAt: string;
}

export interface Candidate {
  element: Element;
  description: string;
}

export interface ResolutionRequest {
  task: ResolutionTask;
  scopeKey: string;
  document: Document;
  pageUrl: string;
  intent: string;
  signal: AbortSignal;
}

export interface ValidCandidate<TPayload> {
  valid: true;
  payload: TPayload;
}

export interface InvalidCandidate {
  valid: false;
  reason: string;
  kind: FailureKind;
}

export type ValidationResult<TPayload> = ValidCandidate<TPayload> | InvalidCandidate;

export interface Resolution<TPayload> {
  element: Element;
  payload: TPayload;
  stage: ResolutionStageName;
}

export interface ResolutionAttempt {
  stage: ResolutionStageName;
  proposals: number;
  failures: string[];
}

export interface ResolvedOutcome<TPayload> {
  resolved: true;
  resolution: Resolution<TPayload>;
  attempts: ResolutionAttempt[];
}

export interface UnresolvedOutcome {
  resolved: false;
  attempts: ResolutionAttempt[];
  failureKind: FailureKind;
}

export type ResolutionOutcome<TPayload> = ResolvedOutcome<TPayload> | UnresolvedOutcome;

export type SelectorRecords = Record<string, LearnedSelector>;
