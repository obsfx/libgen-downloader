import React from 'react';
import { render, Box } from 'ink';

import App from './App';
import { AppContextProvider } from './AppContext';

export default function renderTUI() {
  render(
    <AppContextProvider>
      <Box width="100%" marginLeft={1} paddingRight={4}>
        <App />
      </Box>
    </AppContextProvider>
  );
}
