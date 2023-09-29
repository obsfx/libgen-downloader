import React, { useEffect } from "react";
import { useStdin, Box } from "ink";

// TODO:
// [x] Drop nextPageEntries and use only general entry cache
// [x] Download queue
// [x] Move download progress to entry item
// [x] Result list skeleton loader getting results
// [x] Entry detail download progress
// [x] Alternative download cache map
// [ ] better download status
// [x] Bulk download queue
// [ ] Remove unsued imports and code
// [x] check double press search is causing issues
// [ ] proper error handling
// [ ] disable alternative downloads if no alternative downloads
// [ ] add error logging
// [ ] config fetchin pre scene
// [ ] drop log context
// [ ] drop result list context

import Layouts from "./layouts/index.js";
import { DownloadIndicator } from "./components/DownloadIndicator.js";
import { ErrorMessage } from "./components/ErrorMessage.js";
import { useBoundStore } from "./store/index.js";
import { AppHeader } from "./components/AppHeader.js";

let renderCount = 0;

interface Props {
  doNotFetchConfigInitially: boolean;
}

export function App({ doNotFetchConfigInitially }: Props) {
  //useEventManager();
  //useDownloadManager();

  const { setRawMode } = useStdin();

  const errorMessage = useBoundStore((state) => state.errorMessage);
  const fetchConfig = useBoundStore((state) => state.fetchConfig);

  useEffect(() => {
    if (doNotFetchConfigInitially) {
      return;
    }

    fetchConfig();
  }, []);

  useEffect(() => {
    setRawMode(true);
    return () => {
      setRawMode(false);
    };
  }, [setRawMode]);

  if (errorMessage) {
    return <ErrorMessage />;
  }

  return (
    <Box width={80} marginLeft={1} paddingRight={4} flexDirection="column">
      <AppHeader />
      <Layouts />
      <DownloadIndicator />
    </Box>
  );
}

export default App;
