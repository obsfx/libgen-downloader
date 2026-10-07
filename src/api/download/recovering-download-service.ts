import type { Clock } from "../availability/clock";
import { Deadline } from "../availability/deadline";
import type { RecoveryWaiter } from "../availability/recovery-waiter";
import { outageFromFailures } from "../availability/utils/failures";
import { downloadFile } from "../data/download";
import type { DownloadService } from "./download-service";
import type {
  DownloadCallbacks,
  DownloadOutcome,
  OpenOutcome,
  RecoveryHooks,
  ResolveURLOutcome,
} from "./types";

export class RecoveringDownloadService {
  constructor(
    private readonly createService: () => DownloadService,
    private readonly waiter: RecoveryWaiter,
    private readonly clock: Clock,
    private readonly maxWaitMs: number
  ) {}

  async open(md5: string, hooks: RecoveryHooks = {}): Promise<OpenOutcome> {
    const deadline = new Deadline(this.clock, this.maxWaitMs);
    try {
      return await this.openBefore(deadline, md5, hooks);
    } finally {
      deadline.dispose();
    }
  }

  async download(
    md5: string,
    callbacks: DownloadCallbacks,
    hooks: RecoveryHooks = {}
  ): Promise<DownloadOutcome> {
    const outcome = await this.open(md5, hooks);
    if (!outcome.opened) {
      return { downloaded: false, failures: outcome.failures, waitable: outcome.waitable };
    }
    const { response, sourceName } = outcome.download;
    const result = await downloadFile({ downloadStream: response, ...callbacks });
    return { downloaded: true, result, sourceName };
  }

  async resolveURL(md5: string, hooks: RecoveryHooks = {}): Promise<ResolveURLOutcome> {
    const outcome = await this.open(md5, hooks);
    if (!outcome.opened) {
      return { resolved: false, failures: outcome.failures, waitable: outcome.waitable };
    }
    const { response, sourceName } = outcome.download;
    await response.body?.cancel();
    return { resolved: true, url: response.url, sourceName };
  }

  private async openBefore(
    deadline: Deadline,
    md5: string,
    hooks: RecoveryHooks
  ): Promise<OpenOutcome> {
    const window = { since: deadline.startedAt, deadline: deadline.at };
    for (;;) {
      const outcome = await this.createService().open(md5, deadline.signal);
      const canWait = hooks.shouldWait?.() ?? true;
      if (outcome.opened || !outcome.waitable || !canWait || deadline.signal.aborted) {
        return outcome;
      }
      const outage = outageFromFailures(outcome.failures);
      hooks.onWaiting?.(outage);
      const recovery = await this.waiter.wait({ kind: "download", md5 }, outage, window);
      if (!recovery.recovered) {
        return outcome;
      }
      hooks.onResumed?.(recovery.sources);
    }
  }
}
