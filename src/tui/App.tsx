import React, { useEffect } from "react";
import { useStdin, Box } from "ink";

// TODO:
// [x] Drop nextPageEntries and use only general entry cache
// [x] Download queue
// [ ] Move download progress to entry item
// [ ] Result list skeleton loader getting results
// [ ] better download status
// [ ] Bulk download queue
// [ ] Remove unsued imports and code
// [ ] check double press search is causing issues
// [ ] proper error handling

import Layouts from "./layouts/index.js";
import { DownloadIndicator } from "./components/DownloadIndicator.js";
import { Loader } from "./components/Loader.js";
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

  const isLoading = useBoundStore((state) => state.isLoading);
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
      <Loader />
      <Box display={isLoading ? "none" : "flex"} flexDirection="column">
        <Layouts />
        <DownloadIndicator />
      </Box>
    </Box>
  );
};

export default App;
