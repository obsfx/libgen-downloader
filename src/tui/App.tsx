import React, { useEffect } from "react";
import { useStdin, Box } from "ink";

import Layouts from "./layouts";
import { DownloadIndicator } from "./components/DownloadIndicator";
import { Loader } from "./components/Loader";
import { useErrorContext } from "./contexts/ErrorContext";
import { useAtom } from "jotai";
import { isLoadingAtom } from "./store/app";

const App: React.FC = () => {
  const { setRawMode } = useStdin();
  const [isLoading] = useAtom(isLoadingAtom);
  const { errorThrown } = useErrorContext();

  useEffect(() => {
    setRawMode(true);
    return () => {
      setRawMode(false);
    };
  }, [setRawMode]);

  if (errorThrown) {
    return null;
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
