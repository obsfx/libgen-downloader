import type { HealthCheckResult } from "../types";

export abstract class HealthCheck {
  abstract readonly source: string;

  abstract check(signal: AbortSignal): Promise<HealthCheckResult>;

  protected healthy(): HealthCheckResult {
    return { healthy: true };
  }
}
