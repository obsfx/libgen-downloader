import type { FailureDetails, FailureKind } from "../availability/types";
import type { DownloadResult } from "../models/download-result";

export interface OpenedDownload {
  response: Response;
  sourceName: string;
}

export interface SourceFailure {
  sourceName: string;
  kind: FailureKind;
  reason: string;
}

export interface FailedAttempt {
  failures: SourceFailure[];
  waitable: boolean;
}

export interface OpenedOutcome {
  opened: true;
  download: OpenedDownload;
}

export interface UnopenedOutcome extends FailedAttempt {
  opened: false;
}

export type OpenOutcome = OpenedOutcome | UnopenedOutcome;

export interface CompletedDownload {
  downloaded: true;
  result: DownloadResult;
  sourceName: string;
}

export interface FailedDownload extends FailedAttempt {
  downloaded: false;
}

export type DownloadOutcome = CompletedDownload | FailedDownload;

export interface ResolvedDownloadURL {
  resolved: true;
  url: string;
  sourceName: string;
}

export interface UnresolvedDownloadURL extends FailedAttempt {
  resolved: false;
}

export type ResolveURLOutcome = ResolvedDownloadURL | UnresolvedDownloadURL;

export interface RecoveryHooks {
  shouldWait?: () => boolean;
  onWaiting?: (outage: FailureDetails) => void;
  onResumed?: (sources: string[]) => void;
}

export interface DownloadCallbacks {
  onStart: (filename: string, total: number) => void;
  onData: (filename: string, chunk: Buffer, total: number) => void;
}
