import { Adapter } from "./adapter";
import { LibgenPlusAdapter } from "./libgen-plus-adapter";
import { MirrorType } from "../data/config";

export const getAdapter = (mirrorURL: string, mirrorType: MirrorType): Adapter => {
  switch (mirrorType) {
    case "libgen-plus": {
      return new LibgenPlusAdapter(mirrorURL);
    }
    default: {
      throw new Error(`Unknown mirror type: ${mirrorType}`);
    }
  }
};
