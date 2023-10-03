import React from "react";
import { render } from "ink";

import { LAYOUT_KEY } from "./layouts/keys";
import App from "./App";
import { useBoundStore } from "./store/index";

interface renderTUIArgs {
  startInCLIMode: boolean;
  doNotFetchConfigInitially: boolean;
  initialLayout?: LAYOUT_KEY;
}

export default function renderTUI({
  startInCLIMode,
  doNotFetchConfigInitially,
  initialLayout,
}: renderTUIArgs) {
  if (startInCLIMode) {
    const store = useBoundStore.getState();
    store.setCLIMode(true);
  } else {
    const clearANSI: string = process.platform === "win32" ? "u001b[H\u001bc" : "\u001b[2J";
    // reset screen pos
    process.stdout.write("\u001b[1;1H");
    // clear screen
    process.stdout.write(clearANSI);
  }

  const store = useBoundStore.getState();
  store.setActiveLayout(initialLayout || LAYOUT_KEY.SEARCH_LAYOUT);

  render(<App doNotFetchConfigInitially={doNotFetchConfigInitially} />);
}
