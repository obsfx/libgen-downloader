import React from "react";
import { Box, Text } from "ink";
import { useBoundStore } from "../../store/index.js";
import { DownloadStatusAndProgress } from "../../components/DownloadStatusAndProgress.js";
import { LoadingSpinner } from "../../components/LoadingSpinner.js";

export function BulkDownload() {
  const bulkDownloadQueue = useBoundStore((state) => state.bulkDownloadQueue);
  const isLoading = useBoundStore((state) => state.isLoading);
  const loaderMessage = useBoundStore((state) => state.loaderMessage);

  return (
    <Box flexDirection="column">
      {isLoading && <LoadingSpinner message={loaderMessage} />}
      <Box paddingLeft={3} paddingTop={1} flexDirection="column">
        {bulkDownloadQueue.map((item, idx) => (
          <Box key={idx}>
            <DownloadStatusAndProgress downloadProgressData={item} />
            <Text color="gray">md5: </Text>
            {item.md5 ? <Text color="green">{item.md5}</Text> : <Text color="gray">-</Text>}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
