import React from "react";
import { Box, Text } from "ink";
import { useDownloadContext } from "../contexts/DownloadContext";
import { DownloadStatus } from "../../download-statuses";

const downloadStatusIndicators = {
  [DownloadStatus.IDLE]: null,
  [DownloadStatus.IN_QUEUE]: (
    <Text color="grey" inverse={true}>
      {" "}
      IN QUEUE{" "}
    </Text>
  ),
  [DownloadStatus.PROCESSING]: (
    <Text color="yellowBright" inverse={true}>
      {" "}
      PROCESSING{" "}
    </Text>
  ),
  [DownloadStatus.DOWNLOADING]: (
    <Text color="blueBright" inverse={true}>
      {" "}
      DOWNLOADING{" "}
    </Text>
  ),
  [DownloadStatus.DONE]: (
    <Text color="green" inverse={true}>
      {" "}
      DONE{" "}
    </Text>
  ),
  [DownloadStatus.FAILED]: (
    <Text color="red" inverse={true}>
      {" "}
      FAILED{" "}
    </Text>
  ),
  [DownloadStatus.CONNECTING_TO_LIBGEN]: (
    <Text color="yellowBright" inverse={true}>
      {" "}
      CONNECTING TO LIBGEN{" "}
    </Text>
  ),
};

export const DownloadIndicator: React.FC = () => {
  const { downloadQueueStatus, totalAddedToDownloadQueue, totalDownloaded } = useDownloadContext();

  return (
    <Box flexDirection="column">
      <Text wrap="truncate">
        <Text color="green">
          DONE: {totalDownloaded}/{totalAddedToDownloadQueue}
        </Text>{" "}
        to <Text color="blueBright">{process.cwd()}</Text>
      </Text>
      {downloadStatusIndicators[downloadQueueStatus]}
    </Box>
  );
};
