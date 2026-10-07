import { StatusCodes } from "http-status-codes";
import { DownloadUnavailableError, HttpStatusError, TransientDownloadError } from "../../../errors";
import type { SearchFailure } from "../../search/types";
import type { FailureDetails, FailureKind, NetworkError } from "../types";

const BACKEND_OVERLOAD_PATTERN =
  /could not connect to the database|max_user_connections|too many connections|database error|database is unavailable/i;
const NETWORK_ERROR_NAMES = new Set(["AbortError", "TimeoutError", "TypeError"]);
const OUTAGE_PRIORITY: FailureKind[] = [
  "backend-overloaded",
  "rate-limited",
  "server-error",
  "unreachable",
];
const FAILURE_DESCRIPTIONS = {
  "backend-overloaded": "libgen's database is overloaded",
  "server-error": "libgen servers are returning errors",
  "rate-limited": "libgen is rate limiting requests",
  unreachable: "libgen mirrors are unreachable",
  "not-available": "the book is not available on the mirrors",
} satisfies Record<FailureKind, string>;

export function failureKindFromStatus(status: number, pageText = ""): FailureKind {
  if (BACKEND_OVERLOAD_PATTERN.test(pageText)) {
    return "backend-overloaded";
  }
  if (status === StatusCodes.TOO_MANY_REQUESTS) {
    return "rate-limited";
  }
  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) {
    return "server-error";
  }
  return "not-available";
}

export function isBackendOverloadText(text: string): boolean {
  return BACKEND_OVERLOAD_PATTERN.test(text);
}

function isNetworkError(cause: unknown): cause is NetworkError {
  if (!(cause instanceof Error)) {
    return false;
  }
  return NETWORK_ERROR_NAMES.has(cause.name) || ("code" in cause && typeof cause.code === "string");
}

export function classifyFailure(cause: unknown): FailureKind {
  if (cause instanceof DownloadUnavailableError || cause instanceof TransientDownloadError) {
    return cause.kind;
  }
  if (cause instanceof HttpStatusError) {
    return failureKindFromStatus(cause.status);
  }
  if (isNetworkError(cause)) {
    return "unreachable";
  }
  return "server-error";
}

export function isRetryableFailure(cause: unknown): boolean {
  return !(cause instanceof DownloadUnavailableError);
}

export function failureDetails(cause: unknown): FailureDetails {
  const reason = (cause instanceof Error && cause.message) || "timed out";
  return { kind: classifyFailure(cause), reason };
}

export function describeFailureKind(kind: FailureKind): string {
  return FAILURE_DESCRIPTIONS[kind];
}

export function outageFromFailures(failures: FailureDetails[]): FailureDetails {
  for (const kind of OUTAGE_PRIORITY) {
    const failure = failures.find((candidate) => {
      return candidate.kind === kind;
    });
    if (failure) {
      return { kind: failure.kind, reason: failure.reason };
    }
  }
  return { kind: "unreachable", reason: "no mirror responded" };
}

export function searchFailureDetails(failure: SearchFailure): FailureDetails {
  if (failure.status === "error") {
    return { kind: "unreachable", reason: failure.message };
  }
  return {
    kind: failureKindFromStatus(StatusCodes.SERVICE_UNAVAILABLE, failure.message),
    reason: failure.message,
  };
}
