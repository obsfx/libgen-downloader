import React from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { ResultListItemEntry } from "../../../api/models/ListItem";

const ResultListItemEntry: React.FC<{
  item: ResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
}> = ({ item, isActive, isExpanded }) => {
  return (
    <Box flexDirection="column">
      <Text wrap="truncate" color={isActive ? "yellow" : ""} bold={isActive}>
        {isActive && figures.pointer} [{item.order}] [{item.data.extension}] {item.data.title}
      </Text>
    </Box>
  );
};

export default ResultListItemEntry;
