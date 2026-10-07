import type { TCombinedStore } from "./index";
import { MonitorRecoveryWaiter } from "../../api/availability/monitor-recovery-waiter";
import { HealthCheckFactory } from "../../api/availability/health-checks/health-check-factory";
import type {
  AvailabilityStatus,
  FailureDetails,
  RecoveryOutcome,
  RecoveryTarget,
  WaitWindow,
} from "../../api/availability/types";
import { DownloadSourceFactory } from "../../api/download/download-source-factory";
import { appServices } from "../../api/services/shared-services";
import { CANCELLED } from "../../api/availability/utils/waiting";
import { recoveryMirrors } from "./utils/mirrors";

export interface IAvailabilityState {
  availabilityStatus: AvailabilityStatus;
  libgenWaitDeclined: boolean;
  libgenWaitController: AbortController | undefined;

  waitForLibgen: (
    target: RecoveryTarget,
    outage: FailureDetails,
    window: WaitWindow
  ) => Promise<RecoveryOutcome>;
  checkLibgenNow: () => void;
  stopWaitingForLibgen: () => void;
  allowWaitingForLibgen: () => void;
}

export const initialAvailabilityState = {
  availabilityStatus: { state: "available" } as AvailabilityStatus,
  libgenWaitDeclined: false,
  libgenWaitController: undefined as AbortController | undefined,
};

export const createAvailabilitySlice = (
  set: (
    partial: Partial<TCombinedStore> | ((state: TCombinedStore) => Partial<TCombinedStore>)
  ) => void,
  get: () => TCombinedStore
) => {
  return {
    ...initialAvailabilityState,

    waitForLibgen: async (target: RecoveryTarget, outage: FailureDetails, window: WaitWindow) => {
      if (get().libgenWaitDeclined) {
        return CANCELLED;
      }
      const services = appServices();
      const controller = get().libgenWaitController ?? new AbortController();
      set({ libgenWaitController: controller });

      const unsubscribe = services.availability.subscribe((status) =>
        set({ availabilityStatus: status })
      );
      const waiter = new MonitorRecoveryWaiter(
        services.availability,
        new HealthCheckFactory(
          services.search,
          services.resolverFactory,
          new DownloadSourceFactory(services)
        ),
        (recoveryTarget) => recoveryMirrors(get, recoveryTarget),
        controller.signal
      );

      try {
        const outcome = await waiter.wait(target, outage, window);
        if (outcome.recovered) {
          get().setWarningMessage(
            `libgen is reachable again via ${outcome.sources.join(", ")}, resuming`
          );
        }
        return outcome;
      } finally {
        unsubscribe();
        const status = services.availability.currentStatus();
        set({ availabilityStatus: status });
        if (get().libgenWaitController === controller && status.state === "available") {
          set({ libgenWaitController: undefined });
        }
      }
    },

    checkLibgenNow: () => {
      appServices().availability.checkNow();
    },

    stopWaitingForLibgen: () => {
      get().libgenWaitController?.abort();
      set({ libgenWaitDeclined: true, libgenWaitController: undefined });
    },

    allowWaitingForLibgen: () => {
      set({ libgenWaitDeclined: false });
    },
  };
};
