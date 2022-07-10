import React from "react";
import { render, Box } from "ink";

import { ErrorContextProvider } from "./contexts/ErrorContext";
import { LoaderContextProvider } from "./contexts/LoaderContext";
import { ConfigContextProvider } from "./contexts/ConfigContext";
import { AppContextProvider } from "./contexts/AppContext";
import App from "./App";

export default function renderTUI() {
  const clearANSI: string = process.platform === "win32" ? "u001b[H\u001bc" : "\u001b[2J";
  // reset screen pos
  process.stdout.write("\u001b[1;1H");
  // clear screen
  process.stdout.write(clearANSI);

  render(
    <ErrorContextProvider>
      <LoaderContextProvider>
        <ConfigContextProvider>
          <AppContextProvider>
            <Box width="100%" marginLeft={1} paddingRight={4}>
              <App />
            </Box>
          </AppContextProvider>
        </ConfigContextProvider>
      </LoaderContextProvider>
    </ErrorContextProvider>
  );
}
