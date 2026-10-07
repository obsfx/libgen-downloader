import type { HealthCheck } from "./health-checks/health-check";
import type { MirrorHealthRegistry } from "./mirror-health-registry";
import type { Clock } from "./clock";

export type FailureKind =
  | "backend-overloaded"
  | "server-error"
  | "rate-limited"
  | "unreachable"
  | "not-available";

export interface FailureDetails {
  kind: FailureKind;
  reason: string;
}

export interface NetworkError extends Error {
  code?: string;
}

export interface NamedSource {
  name: string;
}

export type MirrorHealthState = "healthy" | "cooling-down" | "trial";

export interface OrderedSources<T> {
  usable: T[];
  coolingDown: T[];
}

export interface MirrorHealth {
  source: string;
  state: MirrorHealthState;
  consecutiveFailures: number;
  retryAt: number;
  lastFailure?: FailureDetails;
}

export interface BackoffPolicy {
  initialMs: number;
  maxMs: number;
  factor: number;
  jitterRatio: number;
}

export interface HealthyCheckResult {
  healthy: true;
}

export interface UnhealthyCheckResult extends FailureDetails {
  healthy: false;
}

export type HealthCheckResult = HealthyCheckResult | UnhealthyCheckResult;

export interface DownloadRecoveryTarget {
  kind: "download";
  md5: string;
}

export interface SearchRecoveryTarget {
  kind: "search";
  query: string;
}

export type RecoveryTarget = DownloadRecoveryTarget | SearchRecoveryTarget;

export interface LibgenAvailable {
  state: "available";
}

export interface OutageProgress {
  outage: FailureDetails;
  since: number;
  checks: number;
  deadline?: number;
}

export interface WaitingForLibgen extends OutageProgress {
  state: "waiting";
  nextCheckAt: number;
}

export interface CheckingLibgen extends OutageProgress {
  state: "checking";
}

export type AvailabilityStatus = LibgenAvailable | WaitingForLibgen | CheckingLibgen;

export interface LibgenRecovered {
  recovered: true;
  sources: string[];
}

export interface LibgenNotRecovered {
  recovered: false;
  reason: "cancelled" | "timed-out";
}

export type RecoveryOutcome = LibgenRecovered | LibgenNotRecovered;

export interface WaitWindow {
  since: number;
  deadline?: number;
}

export interface WaitRequest extends Partial<WaitWindow> {
  checks: HealthCheck[];
  outage: FailureDetails;
  signal: AbortSignal;
}

export type AvailabilityListener = (status: AvailabilityStatus) => void;

export interface RecoveryWaitDependencies {
  registry: MirrorHealthRegistry;
  policy: BackoffPolicy;
  clock: Clock;
  checkTimeoutMs: number;
  random: () => number;
  publish: (status: AvailabilityStatus) => void;
}
