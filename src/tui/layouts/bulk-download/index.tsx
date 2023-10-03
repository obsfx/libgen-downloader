import React from "react";
import { Box, Text } from "ink";
import InkSpinner from "ink-spinner";
import { useBoundStore } from "../../store/index";
import { DownloadStatusAndProgress } from "../../components/DownloadStatusAndProgress";
import { BulkDownloadAfterCompleteOptions } from "./BulkDownloadAfterCompleteOptions";

export function BulkDownload() {
  const bulkDownloadQueue = useBoundStore((state) => state.bulkDownloadQueue);
  const isBulkDownloadComplete = useBoundStore((state) => state.isBulkDownloadComplete);
  const completedBulkDownloadItemCount = useBoundStore(
    (state) => state.completedBulkDownloadItemCount
  );
  const failedBulkDownloadItemCount = useBoundStore((state) => state.failedBulkDownloadItemCount);
  const createdMD5ListFileName = useBoundStore((state) => state.createdMD5ListFileName);
  const CLIMode = useBoundStore((state) => state.CLIMode);
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

        {!CLIMode && isBulkDownloadComplete && <BulkDownloadAfterCompleteOptions />}
      </Box>
    </Box>
  );
}
