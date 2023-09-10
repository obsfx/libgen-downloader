import React from "react";
import { Box, Text } from "ink";
import { useDownloadContext } from "../contexts/DownloadContext";
import { useAtom } from "jotai";
import { searchValueAtom, currentPageAtom } from "../store/app";

const ResultListInfo: React.FC = () => {
  const { bulkDownloadMap } = useDownloadContext();
  const [searchValue] = useAtom(searchValueAtom);
  const [currentPage] = useAtom(currentPageAtom);

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
