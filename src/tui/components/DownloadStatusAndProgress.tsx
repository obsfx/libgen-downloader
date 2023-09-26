import React from "react";
import { Text } from "ink";
import { IDownloadProgress } from "../store/download-queue.js";
import { getDownloadProgress } from "../helpers/progress.js";
import { downloadStatusIndicators } from "../../download-statuses.js";

interface Props {
  downloadProgressData: IDownloadProgress;
}

export function DownloadStatusAndProgress({ downloadProgressData }: Props) {
  const downloadProgress = getDownloadProgress(
    downloadProgressData.progress || 0,
    downloadProgressData.total
  );

  return (
    <Text>
      {downloadStatusIndicators[downloadProgressData.status]}{" "}
      <Text color="white">
        {downloadProgress?.progressPercentage}% {downloadProgress?.downloadedSize} /{" "}
        {downloadProgress?.totalSize}
      </Text>{" "}
    </Text>
  );
}
