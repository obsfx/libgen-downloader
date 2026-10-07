import type { BackoffPolicy, RecoveryOutcome, WaitRequest } from "../types";

export const CANCELLED: RecoveryOutcome = { recovered: false, reason: "cancelled" };
export const TIMED_OUT: RecoveryOutcome = { recovered: false, reason: "timed-out" };

export function backoffDelay(
  policy: BackoffPolicy,
  attempt: number,
  random: () => number = Math.random
): number {
  const base = Math.min(policy.maxMs, policy.initialMs * policy.factor ** Math.max(0, attempt));
  const jitter = base * policy.jitterRatio * (random() * 2 - 1);
  return Math.round(Math.min(policy.maxMs, Math.max(0, base + jitter)));
}

export function earliestDeadline(requests: Iterable<WaitRequest>): number | undefined {
  const deadlines = [...requests].flatMap(({ deadline }) => {
    if (deadline === undefined) {
      return [];
    }
    return [deadline];
  });
  if (deadlines.length === 0) {
    return undefined;
  }
  return Math.min(...deadlines);
}
