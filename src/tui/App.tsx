import React, { useEffect } from "react";
import { useStdin, Box } from "ink";

import Layouts from "./layouts";
import { DownloadIndicator } from "./components/DownloadIndicator";
import { Loader } from "./components/Loader";
import { useAtom } from "jotai";
import { errorMessageAtom, isLoadingAtom } from "./store/app";
import { useDownloadManager } from "./hooks/useDownloadManager";
import { useEventManager } from "./hooks/useEventManager";
import { ErrorMessage } from "./components/ErrorMessage";

const App: React.FC = () => {
  const { setRawMode } = useStdin();
  const [isLoading] = useAtom(isLoadingAtom);
  const [errorMessage] = useAtom(errorMessageAtom);

  useEventManager();
  useDownloadManager();

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
