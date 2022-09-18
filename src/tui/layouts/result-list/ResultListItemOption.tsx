import React from "react";
import { Text, useInput, Key } from "ink";
import figures from "figures";

import { ResultListItemOption } from "../../../api/models/ListItem";
import { useResultListContext } from "../../contexts/ResultListContext";

const ResultListItemOption: React.FC<{
  item: ResultListItemOption;
  isActive: boolean;
}> = ({ item, isActive }) => {
  const { anyEntryExpanded } = useResultListContext();

  useInput(
    (_, key: Key) => {
      if (key.return) {
        item.data.onSelect();
      }
    },
    { isActive }
  );

  return (
    <Text
      wrap="truncate"
      color={anyEntryExpanded ? "gray" : isActive ? "green" : "yellow"}
      bold={isActive}
    >
      {isActive && figures.pointer} {item.data.label}
    </Text>
  );
};

export default ResultListItemOption;
