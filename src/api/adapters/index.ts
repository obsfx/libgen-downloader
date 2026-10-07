import { Adapter } from "./adapter";
import { LibgenPlusAdapter } from "./libgen-plus-adapter";
import { MirrorType } from "../data/types";
import { UnknownMirrorTypeError } from "../../errors";

export const getAdapter = (mirrorURL: string, mirrorType: MirrorType): Adapter => {
  switch (mirrorType) {
    case "libgen-plus": {
      return new LibgenPlusAdapter(mirrorURL);
    }
    default: {
      throw new UnknownMirrorTypeError(mirrorType);
    }
  }
};
