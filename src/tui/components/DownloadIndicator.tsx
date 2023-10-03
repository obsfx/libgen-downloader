import React from "react";
import { Box, Text } from "ink";
import { useBoundStore } from "../store/index";

export const DownloadIndicator: React.FC = () => {
  const totalAddedToDownloadQueue = useBoundStore((state) => state.totalAddedToDownloadQueue);
  const totalDownloaded = useBoundStore((state) => state.totalDownloaded);
  const totalFailed = useBoundStore((state) => state.totalFailed);

  if (totalAddedToDownloadQueue === 0) {
    return null;
  }

  return (
    <Box flexDirection="column">
      <Text wrap="truncate">
        <Text color="green">
          DONE {totalDownloaded}/{totalAddedToDownloadQueue}
        </Text>{" "}
        {totalFailed > 0 && <Text color="redBright">FAIL ({totalFailed}) </Text>}
        to <Text color="blueBright">{process.cwd()}</Text>
      </Text>
    </Box>
  );
};
