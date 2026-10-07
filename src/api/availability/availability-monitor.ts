import type { Clock } from "./clock";
import type { MirrorHealthRegistry } from "./mirror-health-registry";
import { SharedRecoveryWait } from "./shared-recovery-wait";
import type {
  AvailabilityListener,
  AvailabilityStatus,
  BackoffPolicy,
  RecoveryOutcome,
  WaitRequest,
} from "./types";
import { CANCELLED } from "./utils/waiting";

export class AvailabilityMonitor {
  private status: AvailabilityStatus = { state: "available" };
  private readonly listeners = new Set<AvailabilityListener>();
  private currentWait: SharedRecoveryWait | undefined;

  constructor(
    private readonly registry: MirrorHealthRegistry,
    private readonly policy: BackoffPolicy,
    private readonly clock: Clock,
    private readonly checkTimeoutMs: number,
    private readonly random: () => number = Math.random
  ) {}

  currentStatus(): AvailabilityStatus {
    return this.status;
  }

  subscribe(listener: AvailabilityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  checkNow(): void {
    this.currentWait?.checkNow();
  }

  async waitForRecovery(request: WaitRequest): Promise<RecoveryOutcome> {
    if (request.signal.aborted) {
      return CANCELLED;
    }
    if (!this.currentWait) {
      this.currentWait = this.startWait(request);
    }
    return this.currentWait.join(request);
  }

  private startWait(request: WaitRequest): SharedRecoveryWait {
    const wait: SharedRecoveryWait = new SharedRecoveryWait(
      request,
      {
        registry: this.registry,
        policy: this.policy,
        clock: this.clock,
        checkTimeoutMs: this.checkTimeoutMs,
        random: this.random,
        publish: (status) => {
          this.publish(status);
        },
      },
      () => {
        if (this.currentWait === wait) {
          this.currentWait = undefined;
          this.publish({ state: "available" });
        }
      }
    );
    return wait;
  }

  private publish(status: AvailabilityStatus): void {
    this.status = status;
    for (const listener of this.listeners) {
      listener(status);
    }
  }
}
