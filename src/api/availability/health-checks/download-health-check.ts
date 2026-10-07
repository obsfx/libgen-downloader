import type { DownloadSource } from "../../download/download-source";
import type { HealthCheckResult } from "../types";
import { failureDetails } from "../utils/failures";
import { HealthCheck } from "./health-check";

export class DownloadHealthCheck extends HealthCheck {
  readonly source: string;

  constructor(
    private readonly downloadSource: DownloadSource,
    private readonly md5: string
  ) {
    super();
    this.source = downloadSource.name;
  }

  async check(signal: AbortSignal): Promise<HealthCheckResult> {
    try {
      const response = await this.downloadSource.open(this.md5, signal);
      await response.body?.cancel();
      return this.healthy();
    } catch (error) {
      return { healthy: false, ...failureDetails(error) };
    }
  }
}
