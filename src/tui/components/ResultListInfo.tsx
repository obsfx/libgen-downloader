import React from "react";
import { Box, Text } from "ink";
import { useDownloadContext } from "../contexts/DownloadContext";
import { useAppStateContext } from "../contexts/AppStateContext";

const ResultListInfo: React.FC = () => {
  const { bulkDownloadMap } = useDownloadContext();
  const { searchValue, currentPage } = useAppStateContext();

  return (
    <Box>
      <Text wrap="truncate">
        Results for <Text color="green">{searchValue}</Text> on page{" "}
        <Text color="yellow">{currentPage}</Text>
      </Text>
      <Text color="gray">{" | "}</Text>
      <Text wrap="truncate">
        Bulk download queue:{" "}
        <Text color="green">
          {Object.entries(bulkDownloadMap).filter(([_, val]) => val).length}
        </Text>
      </Text>
    </Box>
  );
};

export default ResultListInfo;
