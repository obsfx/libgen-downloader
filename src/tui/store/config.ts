import { StateCreator } from "zustand";
import { TCombinedStore } from "./index.js";
import { Config, fetchConfig, findMirror } from "../../api/data/config.js";
import Label from "../../labels.js";
import { attempt } from "../../utils.js";

export interface IConfigState extends Config {
  mirror: string;
  fetchConfig: () => Promise<void>;
}

export const initialConfigState = {
  latestVersion: "",
  mirrors: [],
  searchReqPattern: "",
  searchByMD5Pattern: "",
  MD5ReqPattern: "",
  mirror: "",
};

export const createConfigStateSlice: StateCreator<TCombinedStore, [], [], IConfigState> = (
  set,
  get
) => ({
  ...initialConfigState,

  fetchConfig: async () => {
    const store = get();

    store.setIsLoading(true);
    store.setLoaderMessage(Label.FETCHING_CONFIG);

    const config = await attempt(fetchConfig);

    if (!config) {
      store.setIsLoading(false);
      // throw error
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
      // throw error
      return;
    }

    set({
      ...config,
      mirror,
    });
  },
});
