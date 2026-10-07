import { LibgenPlusAdapter } from "../../adapters/libgen-plus-adapter";
import type { Mirror } from "../../data/types";
import type { DownloadSourceFactory } from "../../download/download-source-factory";
import type { SearchService } from "../../search/search-service";
import type { ResolverFactory } from "../../resolution/resolver-factory";
import type { RecoveryTarget } from "../types";
import { DownloadHealthCheck } from "./download-health-check";
import type { HealthCheck } from "./health-check";
import { SearchHealthCheck } from "./search-health-check";

export class HealthCheckFactory {
  constructor(
    private readonly search: SearchService,
    private readonly resolvers: ResolverFactory,
    private readonly sources: DownloadSourceFactory
  ) {}

  create(target: RecoveryTarget, mirrors: Mirror[]): HealthCheck[] {
    return mirrors.flatMap((mirror) => {
      return this.checksFor(target, mirror);
    });
  }

  private checksFor(target: RecoveryTarget, mirror: Mirror): HealthCheck[] {
    if (target.kind === "download") {
      return [new DownloadHealthCheck(this.sources.createSource(mirror), target.md5)];
    }
    if (mirror.type === "libgen-spa") {
      return [];
    }
    const adapter = new LibgenPlusAdapter(mirror.src, this.resolvers);
    return [new SearchHealthCheck(adapter, this.search, target.query)];
  }
}
