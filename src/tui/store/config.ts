import { TCombinedStore } from "./index";
import { Config, fetchConfig, findMirror, Mirror } from "../../api/data/config";
import Label from "../../labels";
import { attempt } from "../../utilities";
import { Adapter } from "../../api/adapters/adapter";
import { getAdapter } from "../../api/adapters";
import { getDocument } from "../../api/data/document";
import { SEARCH_PAGE_SIZE } from "../../settings";
import { MirrorCheckStatus } from "./app";

export interface IConfigState extends Config {
  mirrorAdapter: Adapter | undefined;
  mirror: Mirror | undefined;
  fetchConfig: () => Promise<void>;
  switchMirror: (
    onMirrorStatus: (mirror: string, status: MirrorCheckStatus) => void
  ) => Promise<boolean>;
}

export const initialConfigState: Omit<IConfigState, "fetchConfig" | "switchMirror"> = {
  mirrorAdapter: undefined,
  latestVersion: "",
  mirrors: [],
  mirror: undefined,
};

export const createConfigStateSlice = (
  set: (partial: Partial<TCombinedStore> | ((state: TCombinedStore) => Partial<TCombinedStore>)) => void,
  get: () => TCombinedStore
) => ({
  ...initialConfigState,

  fetchConfig: async () => {
    const store = get();

    store.setIsLoading(true);
    store.setLoaderMessage(Label.FETCHING_CONFIG);

    const config = await attempt(fetchConfig);

    if (!config) {
      store.setIsLoading(false);
      store.setErrorMessage("Couldn't fetch the config");
      return;
    }

    // Find an available mirror
    store.setLoaderMessage(Label.FINDING_MIRROR);
    const mirror = await findMirror(config.mirrors, (failedMirror: string) => {
      store.setLoaderMessage(
        `${Label.COULDNT_REACH_TO_MIRROR}, ${failedMirror}. ${Label.FINDING_MIRROR}`
      );
    });
    store.setIsLoading(false);

    if (!mirror) {
      store.setErrorMessage("Couldn't find a working mirror");
      return;
    }

    const mirrorAdapter = getAdapter(mirror.src, mirror.type);

    set({
      ...config,
      mirror,
      mirrorAdapter,
    });
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
        const testURL = adapter.getSearchURL("test", 1, SEARCH_PAGE_SIZE);
        const result = await getDocument(testURL);
        const connectionError = adapter.detectConnectionError(result.document);

        if (connectionError) {
          onMirrorStatus(mirror.src, "failed");
          continue;
        }

        // Mirror works — switch to it
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
});
