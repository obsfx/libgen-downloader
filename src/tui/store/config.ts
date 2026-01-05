import { TCombinedStore } from "./index";
import { Config, fetchConfig, findMirror, Mirror } from "../../api/data/config";
import Label from "../../labels";
import { attempt } from "../../utils";
import { Adapter } from "../../api/adapters/Adapter";
import { getAdapter } from "../../api/adapters";

export interface IConfigState extends Config {
  mirrorAdapter: Adapter | null;
  mirror: Mirror | null;
  fetchConfig: () => Promise<void>;
}

export const initialConfigState: Omit<IConfigState, "fetchConfig"> = {
  mirrorAdapter: null,
  latestVersion: "",
  mirrors: [],
  mirror: null,
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
});
