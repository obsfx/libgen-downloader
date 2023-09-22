import React, { useEffect } from "react";
import { useStdin, Box } from "ink";

// TODO:
// [x] Drop nextPageEntries and use only general entry cache
// [x] Download queue
// [ ] Move result list logic to zustand
// [ ] Move result list entry logic to zustand
// [ ] Move download progress to entry item
// [x] Result list skeleton loader getting results
// [x] Entry detail download progress
// [x] Alternative download cache map
// [ ] better download status
// [ ] Bulk download queue
// [ ] Remove unsued imports and code
// [ ] check double press search is causing issues
// [ ] proper error handling
// [ ] disable alternative downloads if no alternative downloads

import Layouts from "./layouts/index.js";
import { DownloadIndicator } from "./components/DownloadIndicator.js";
//import { useAtom } from "jotai";
//import { errorMessageAtom, isLoadingAtom } from "./store/app";
//import { useDownloadManager } from "./hooks/useDownloadManager";
//import { useEventManager } from "./hooks/useEventManager";
import { ErrorMessage } from "./components/ErrorMessage.js";
//import { useConfig } from "./hooks/useConfig";
import { useBoundStore } from "./store/index.js";

let renderCount = 0;
const App: React.FC = () => {
  //useEventManager();
  //useDownloadManager();

  const { setRawMode } = useStdin();

  const errorMessage = useBoundStore((state) => state.errorMessage);
  const fetchConfig = useBoundStore((state) => state.fetchConfig);

  useEffect(() => {
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
      <Layouts />
      <DownloadIndicator />
    </Box>
  );
};

export default App;
