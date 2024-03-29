import React from "react";
import { Text } from "ink";

export enum DownloadStatus {
  IDLE = "IDLE",
  IN_QUEUE = "IN_QUEUE",
  PROCESSING = "PROCESSING",
  DOWNLOADING = "DOWNLOADING",
  DOWNLOADED = "DOWNLOADED",
  FAILED = "FAILED",
  CONNECTING_TO_LIBGEN = "CONNECTING_TO_LIBGEN",
  FETCHING_MD5 = "FETCHING_MD5",
}

export const downloadStatusIndicators = {
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
  [DownloadStatus.DOWNLOADED]: (
    <Text color="green" inverse={true}>
      {" "}
      DOWNLOADED{" "}
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
  [DownloadStatus.FETCHING_MD5]: (
    <Text color="whiteBright" inverse={true}>
      {" "}
      FETCHING MD5{" "}
    </Text>
  ),
};
