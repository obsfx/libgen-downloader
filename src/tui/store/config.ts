import { TCombinedStore } from "./index";
import type { Config, Mirror } from "../../api/data/types";
import { Label } from "../../labels";
import { attempt } from "../../utilities";
import { Adapter } from "../../api/adapters/adapter";
import { getAdapter } from "../../api/adapters";
import { MAX_BOOK_WAIT_MS } from "../../settings";
import { MirrorCheckStatus } from "./app";
import { DownloadService } from "../../api/download/download-service";
import { RecoveringDownloadService } from "../../api/download/recovering-download-service";
import { StoreRecoveryWaiter } from "./store-recovery-waiter";
import { DownloadSourceFactory } from "../../api/download/download-source-factory";
import { appServices } from "../../api/services/shared-services";
import { uniqueMirrors } from "./utils/mirrors";

export interface IConfigState extends Config {
  mirrorAdapter: Adapter | undefined;
  mirror: Mirror | undefined;
  downloadMirrors: Mirror[];
  fetchConfig: () => Promise<void>;
  switchMirror: (
    onMirrorStatus: (mirror: string, status: MirrorCheckStatus) => void
  ) => Promise<boolean>;
  getDownloadService: () => DownloadService;
  getRecoveringDownloadService: () => RecoveringDownloadService;
  orderedDownloadMirrors: () => Mirror[];
  steerToMirror: (sourceName: string) => boolean;
}

export const initialConfigState: Omit<
  IConfigState,
  | "fetchConfig"
  | "switchMirror"
  | "getDownloadService"
  | "getRecoveringDownloadService"
  | "orderedDownloadMirrors"
  | "steerToMirror"
> = {
  mirrorAdapter: undefined,
  latestVersion: "",
  mirrors: [],
  downloadMirrors: [],
  mirror: undefined,
};

export const createConfigStateSlice = (
  set: (
    partial: Partial<TCombinedStore> | ((state: TCombinedStore) => Partial<TCombinedStore>)
  ) => void,
  get: () => TCombinedStore
) => {
  return {
    ...initialConfigState,

    fetchConfig: async () => {
      const store = get();

      store.setIsLoading(true);
      store.setLoaderMessage(Label.FETCHING_CONFIG);

      const remoteConfig = appServices().config;
      const config = await attempt((signal) => {
        return remoteConfig.load(signal);
      });

      if (!config) {
        store.setIsLoading(false);
        store.setErrorMessage("Couldn't fetch the config");
        return;
      }

      // Find an available mirror
      store.setLoaderMessage(Label.FINDING_MIRROR);
      const mirror = await remoteConfig.findReachableMirror(
        config.mirrors,
        (failedMirror: string) => {
          store.setLoaderMessage(
            `${Label.COULDNT_REACH_TO_MIRROR}, ${failedMirror}. ${Label.FINDING_MIRROR}`
          );
        }
      );
      store.setIsLoading(false);

      if (!mirror) {
        store.setErrorMessage("Couldn't find a working mirror");
        return;
      }

      const mirrorAdapter = getAdapter(mirror.src, mirror.type);

      set({
        ...config,
        downloadMirrors: uniqueMirrors([...config.mirrors, ...config.downloadMirrors]),
        mirror,
        mirrorAdapter,
      });
    },

    orderedDownloadMirrors: () => {
      const { mirror, downloadMirrors } = get();
      return uniqueMirrors(
        [mirror, ...downloadMirrors].filter((candidate) => candidate !== undefined)
      );
    },

    getDownloadService: () => {
      const services = appServices();
      return new DownloadService(
        new DownloadSourceFactory(services).createSources(get().orderedDownloadMirrors()),
        services.downloadRetry,
        services.mirrorHealth
      );
    },

    getRecoveringDownloadService: () => {
      return new RecoveringDownloadService(
        () => get().getDownloadService(),
        new StoreRecoveryWaiter(get),
        appServices().clock,
        MAX_BOOK_WAIT_MS
      );
    },

    steerToMirror: (sourceName: string) => {
      const target = get().mirrors.find((candidate) => new URL(candidate.src).host === sourceName);
      if (!target || target.src === get().mirror?.src) {
        return false;
      }
      set({ mirror: target, mirrorAdapter: getAdapter(target.src, target.type) });
      get().resetEntryCacheMap();
      return true;
    },

    switchMirror: async (
      onMirrorStatus: (mirror: string, status: MirrorCheckStatus) => void
    ): Promise<boolean> => {
      const store = get();
      const currentMirrorSource = store.mirror?.src;
      const otherMirrors = store.mirrors.filter((m) => m.src !== currentMirrorSource);

      if (otherMirrors.length === 0) {
        return false;
      }

      for (const mirror of otherMirrors) {
        onMirrorStatus(mirror.src, "checking");

        try {
          const adapter = getAdapter(mirror.src, mirror.type);
          const page = await attempt((signal) => {
            return appServices().search.fetchPage(adapter, "test", 1, signal);
          });
          if (page?.status !== "loaded") {
            onMirrorStatus(mirror.src, "failed");
            continue;
          }

          onMirrorStatus(mirror.src, "ok");
          set({ mirror, mirrorAdapter: adapter });
          get().resetEntryCacheMap();
          return true;
        } catch {
          onMirrorStatus(mirror.src, "failed");
        }
      }

      return false;
    },
  };
};
