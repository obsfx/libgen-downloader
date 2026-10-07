import type { TCombinedStore } from "./index";
import { RecoveryWaiter } from "../../api/availability/recovery-waiter";
import type {
  FailureDetails,
  RecoveryOutcome,
  RecoveryTarget,
  WaitWindow,
} from "../../api/availability/types";

export class StoreRecoveryWaiter extends RecoveryWaiter {
  constructor(private readonly get: () => TCombinedStore) {
    super();
  }

  wait(
    target: RecoveryTarget,
    outage: FailureDetails,
    window: WaitWindow
  ): Promise<RecoveryOutcome> {
    return this.get().waitForLibgen(target, outage, window);
  }
}
