import React from "react";
import { Text, useInput, Key } from "ink";
import figures from "figures";

import { ResultListItemOption } from "../../../api/models/ListItem";
import { useAppContext } from "../../contexts/AppContext";

const ResultListItemOption: React.FC<{
  item: ResultListItemOption;
  isActive: boolean;
}> = ({ item, isActive }) => {
  const { anyEntryExpanded } = useAppContext();

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
      color={anyEntryExpanded ? "gray" : isActive ? "cyanBright" : "yellow"}
      bold={isActive}
    >
      {isActive && figures.pointer} {item.data.label}
    </Text>
  );
};

export default ResultListItemOption;
