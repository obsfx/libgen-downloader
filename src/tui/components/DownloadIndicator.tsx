import React from "react";
import { Box, Text } from "ink";
import { filesize } from "filesize";
import { DownloadStatus } from "../../download-statuses";
import { useBoundStore } from "../store";

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
  const downloadQueueStatus = useBoundStore((state) => state.downloadQueueStatus);
  const totalAddedToDownloadQueue = useBoundStore((state) => state.totalAddedToDownloadQueue);
  const totalDownloaded = useBoundStore((state) => state.totalDownloaded);
  const totalFailed = useBoundStore((state) => state.totalFailed);
  const currentDownloadProgress = useBoundStore((state) => state.currentDownloadProgress);

  const progressPercentage = (
    currentDownloadProgress.total === 0
      ? 0
      : (currentDownloadProgress.progress / currentDownloadProgress.total) * 100
  ).toFixed(2);

  const downloadedSize = filesize(currentDownloadProgress.progress, {
    base: 2,
    standard: "jedec",
  });

  const totalSize = filesize(currentDownloadProgress.total, {
    base: 2,
    standard: "jedec",
  });

  console.log("DownloadIndicator rendered");

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
      <Text wrap="truncate">
        {downloadStatusIndicators[downloadQueueStatus]}
        <Text color="greenBright"> {progressPercentage}%</Text>
        <Text color="magentaBright">
          {" "}
          {downloadedSize}/{totalSize}
        </Text>
        <Text color="yellow"> {currentDownloadProgress.filename}</Text>
      </Text>
    </Box>
  );
};
