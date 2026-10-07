import { HealthCheck } from "../../src/api/availability/health-checks/health-check";
import type { HealthCheckResult } from "../../src/api/availability/types";

export class FakeHealthCheck extends HealthCheck {
  calls = 0;

  constructor(
    readonly source: string,
    private readonly results: HealthCheckResult[]
  ) {
    super();
  }

  async check(): Promise<HealthCheckResult> {
    const result = this.results[Math.min(this.calls, this.results.length - 1)];
    this.calls += 1;
    return result;
  }
}
