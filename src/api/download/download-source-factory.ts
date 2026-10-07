import { LibgenPlusAdapter } from "../adapters/libgen-plus-adapter";
import type { Mirror } from "../data/types";
import type { AppServices } from "../services/app-services";
import { LibgenSpaClient } from "../spa/libgen-spa-client";
import { DownloadPageResolver } from "./download-page-resolver";
import type { DownloadSource } from "./download-source";
import { LibgenPlusDownloadSource } from "./libgen-plus-download-source";
import { LibgenSpaDownloadSource } from "./libgen-spa-download-source";

export class DownloadSourceFactory {
  constructor(private readonly services: AppServices) {}

  createSources(mirrors: Mirror[]): DownloadSource[] {
    return mirrors.map((mirror) => this.createSource(mirror));
  }

  createSource(mirror: Mirror): DownloadSource {
    const { http, resolverFactory } = this.services;
    const pageResolver = new DownloadPageResolver(resolverFactory);
    switch (mirror.type) {
      case "libgen-plus": {
        return new LibgenPlusDownloadSource(
          new LibgenPlusAdapter(mirror.src, resolverFactory),
          http,
          pageResolver
        );
      }
      case "libgen-spa": {
        return new LibgenSpaDownloadSource(
          mirror.src,
          new LibgenSpaClient(mirror.src, http),
          http,
          pageResolver
        );
      }
    }
  }
}
