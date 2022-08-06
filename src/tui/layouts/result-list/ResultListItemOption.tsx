import React from "react";
import { Text, useInput, Key } from "ink";
import figures from "figures";

import { ResultListItemOption } from "../../../api/models/ListItem";

const ResultListItemOption: React.FC<{
  item: ResultListItemOption;
  isActive: boolean;
  isFadedOut: boolean;
}> = ({ item, isActive, isFadedOut }) => {
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
      color={isFadedOut ? "gray" : isActive ? "green" : "yellow"}
      bold={isActive}
    >
      {isActive && figures.pointer} {item.data.label}
    </Text>
  );
};

export default ResultListItemOption;
