import React, { useEffect } from "react";
import { useStdin, Box, Text } from "ink";

import Layouts from "./layouts";
import { DownloadIndicator } from "./components/DownloadIndicator";

const App: React.FC = () => {
  const { setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);
    return () => {
      setRawMode(false);
    };
  }, [setRawMode]);

  return (
    <Box width={80} marginLeft={1} paddingRight={4} flexDirection="column">
      <Layouts />
      <DownloadIndicator />
    </Box>
  );
};

export default App;
