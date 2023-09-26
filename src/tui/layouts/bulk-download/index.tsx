import React from "react";
import { Box, Text } from "ink";
import { useBoundStore } from "../../store/index.js";
import { DownloadStatusAndProgress } from "../../components/DownloadStatusAndProgress.js";
import InkSpinner from "ink-spinner";
import { BulkDownloadAfterCompleteOptions } from "./BulkDownloadAfterCompleteOptions.js";

export function BulkDownload() {
  const bulkDownloadQueue = useBoundStore((state) => state.bulkDownloadQueue);
  const isBulkDownloadComplete = useBoundStore((state) => state.isBulkDownloadComplete);
  const completedBulkDownloadItemCount = useBoundStore(
    (state) => state.completedBulkDownloadItemCount
  );
  const failedBulkDownloadItemCount = useBoundStore((state) => state.failedBulkDownloadItemCount);
  const createdMD5ListFileName = useBoundStore((state) => state.createdMD5ListFileName);
  const totalItemCount = bulkDownloadQueue.length;

  return (
    <Box flexDirection="column">
      <Box paddingLeft={3} flexDirection="column">
        <Text wrap="truncate-end">
          <Text color="greenBright">COMPLETED ({completedBulkDownloadItemCount}) </Text>
          <Text color="redBright">FAILED ({failedBulkDownloadItemCount}) </Text>
          <Text color="white">TOTAL ({totalItemCount})</Text>
        </Text>

        <Text color="gray">
          {createdMD5ListFileName ? (
            <Text>
              MD5 list file created: <Text color="blueBright">{createdMD5ListFileName}</Text>
            </Text>
          ) : (
            <InkSpinner type="simpleDotsScrolling" />
          )}
        </Text>

        <Text color="white">
          Downloading files to <Text color="blueBright">{process.cwd()}</Text>
        </Text>

        {bulkDownloadQueue.map((item, idx) => (
          <Text key={idx} wrap="truncate-end">
            <DownloadStatusAndProgress downloadProgressData={item} />
            {item.filename ? (
              <Text>
                <Text color="green">{item.filename}</Text>
              </Text>
            ) : item.md5 ? (
              <Text>
                <Text color="gray">md5: </Text>
                <Text color="green">{item.md5}</Text>
              </Text>
            ) : (
              <Text color="gray">-</Text>
            )}
          </Text>
        ))}

        {isBulkDownloadComplete && <BulkDownloadAfterCompleteOptions />}
      </Box>
    </Box>
  );
}
