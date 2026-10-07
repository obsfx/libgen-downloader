import type { Adapter } from "../../adapters/adapter";
import type { SearchService } from "../../search/search-service";
import type { HealthCheckResult } from "../types";
import { failureDetails, searchFailureDetails } from "../utils/failures";
import { HealthCheck } from "./health-check";

export class SearchHealthCheck extends HealthCheck {
  readonly source: string;

  constructor(
    private readonly adapter: Adapter,
    private readonly search: SearchService,
    private readonly query: string
  ) {
    super();
    this.source = new URL(adapter.baseURL).host;
  }

  async check(signal: AbortSignal): Promise<HealthCheckResult> {
    try {
      const page = await this.search.fetchPage(this.adapter, this.query, 1, signal);
      if (page.status === "loaded") {
        return this.healthy();
      }
      return { healthy: false, ...searchFailureDetails(page) };
    } catch (error) {
      return { healthy: false, ...failureDetails(error) };
    }
  }
}
