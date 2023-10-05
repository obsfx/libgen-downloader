import { GetState, SetState } from "zustand";
import { TCombinedStore } from "./index";
import { Config, fetchConfig, findMirror } from "../../api/data/config";
import Label from "../../labels";
import { attempt } from "../../utils";

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
  columnFilterQueryParamKey: "",
  columnFilterQueryParamValues: {},
};

export const createConfigStateSlice = (
  set: SetState<TCombinedStore>,
  get: GetState<TCombinedStore>
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

    set({
      ...config,
      mirror,
    });
  },
});
