import React from "react";
import { render } from "ink";

import { LAYOUT_KEY } from "./layouts/keys";
import App from "./App";
import { useBoundStore } from "./store";

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
  }

  const store = useBoundStore.getState();
  store.setActiveLayout(initialLayout || LAYOUT_KEY.SEARCH_LAYOUT);

  render(<App doNotFetchConfigInitially={doNotFetchConfigInitially} />);
}
