import React from "react";
import { Box, Text } from "ink";
import { useAppContext } from "../contexts/AppContext";

const ResultListInfo: React.FC = () => {
  const { searchValue, currentPage } = useAppContext();

  return (
    <Box>
      <Text wrap="truncate">
        Results for <Text color="green">{searchValue}</Text> on page{" "}
        <Text color="yellow">{currentPage}</Text>
      </Text>
    </Box>
  );
};

export default ResultListInfo;
