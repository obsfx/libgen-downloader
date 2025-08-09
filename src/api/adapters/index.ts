import { Adapter } from "./Adapter";
import { LibgenPlusAdapter } from "./LibgenPlusAdapter";
import { MirrorType } from "../data/config";

export const getAdapter = (mirrorURL: string, mirrorType: MirrorType): Adapter => {
  switch (mirrorType) {
    case "libgen-plus":
      return new LibgenPlusAdapter(mirrorURL);
    default:
      throw new Error(`Unknown mirror type: ${mirrorType}`);
  }
};
