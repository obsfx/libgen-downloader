import React from "react";
import { Box, Text } from "ink";
import { useBoundStore } from "../store";

const ResultListInfo: React.FC = () => {
  const searchValue = useBoundStore((state) => state.searchValue);
  const currentPage = useBoundStore((state) => state.currentPage);
  const bulkDownloadSelectedEntries = useBoundStore((state) => state.bulkDownloadSelectedEntries);

  const bulkDownloadSelectedEntriesCount = Object.keys(bulkDownloadSelectedEntries).length;

  return (
    <Box>
      <Text wrap="truncate">
        Results for <Text color="green">{searchValue}</Text> on page{" "}
        <Text color="yellow">{currentPage}</Text>
      </Text>
      <Text color="gray">{" | "}</Text>
      <Text wrap="truncate">
        Bulk download queue: <Text color="green">{bulkDownloadSelectedEntriesCount}</Text>
      </Text>
    </Box>
  );
};

export default ResultListInfo;
