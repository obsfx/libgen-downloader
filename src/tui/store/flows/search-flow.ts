import type { WaitWindow } from "../../../api/availability/types";
import { searchFailureDetails } from "../../../api/availability/utils/failures";
import type { Entry } from "../../../api/models/entry";
import { appServices } from "../../../api/services/shared-services";
import { Label } from "../../../labels";
import { CLI_MAX_LIBGEN_WAIT_MS } from "../../../settings";
import type { TCombinedStore } from "../index";
import type { SearchFailure, SearchResult } from "../../../api/search/types";

export class SearchFlow {
  constructor(private readonly get: () => TCombinedStore) {}

  async handle(result: SearchResult): Promise<void> {
    switch (result.status) {
      case "success": {
        this.showResults(result.entries);
        return;
      }
      case "connection_error":
      case "error": {
        await this.recover(result);
        return;
      }
    }
  }

  private async recover(failure: SearchFailure): Promise<void> {
    this.get().setConnectionError(failure.message);
    const switched = await this.failOverToOtherMirrors();
    if (!switched) {
      await this.waitForRecovery(failure);
      return;
    }
    const retried = await this.retry();
    if (retried.status === "success") {
      this.showResults(retried.entries);
      return;
    }
    this.get().setConnectionError(retried.message);
    await this.waitForRecovery(retried);
  }

  private async failOverToOtherMirrors(): Promise<boolean> {
    const store = this.get();
    const otherMirrors = store.mirrors.filter((mirror) => {
      return mirror.src !== store.mirror?.src;
    });
    if (otherMirrors.length === 0) {
      return false;
    }
    store.setMirrorCheckStates(
      otherMirrors.map((mirror) => {
        return { src: mirror.src, status: "pending" as const };
      })
    );
    return store.switchMirror((mirrorSource, status) => {
      this.get().setMirrorCheckStates(
        this.get().mirrorCheckStates.map((state) => {
          if (state.src === mirrorSource) {
            return { ...state, status };
          }
          return state;
        })
      );
    });
  }

  private async waitForRecovery(failure: SearchFailure): Promise<void> {
    let outage = searchFailureDetails(failure);
    const window = this.waitWindow();
    for (;;) {
      this.get().setMirrorCheckStates([]);
      const recovery = await this.get().waitForLibgen(
        { kind: "search", query: this.get().searchValue },
        outage,
        window
      );
      if (!recovery.recovered) {
        this.giveUp();
        return;
      }
      for (const source of recovery.sources) {
        this.get().steerToMirror(source);
      }
      const retried = await this.retry();
      if (retried.status === "success") {
        this.showResults(retried.entries);
        return;
      }
      this.get().setConnectionError(retried.message);
      outage = searchFailureDetails(retried);
    }
  }

  private retry(): Promise<SearchResult> {
    const store = this.get();
    store.setLoaderMessage(Label.GETTING_RESULTS);
    return store.search(store.searchValue, store.currentPage);
  }

  private showResults(entries: Entry[]): void {
    const store = this.get();
    store.setConnectionError(undefined);
    store.setMirrorCheckStates([]);
    store.setEntries(entries);
    store.setIsLoading(false);
    store.checkNextPage(store.searchValue, store.currentPage + 1);
  }

  private giveUp(): void {
    const store = this.get();
    store.setMirrorCheckStates([]);
    store.setIsLoading(false);
    store.setErrorMessage(Label.ALL_MIRRORS_FAILED);
  }

  private waitWindow(): WaitWindow {
    const since = appServices().clock.now();
    if (this.get().CLIMode) {
      return { since, deadline: since + CLI_MAX_LIBGEN_WAIT_MS };
    }
    return { since };
  }
}
