import React from "react";
import { Text, useInput } from "ink";
import figures from "figures";

import { IResultListItemOption } from "../../../api/models/ListItem";
import { useBoundStore } from "../../store/index";

const ResultListItemOption: React.FC<{
  item: IResultListItemOption;
  isActive: boolean;
}> = ({ item, isActive }) => {
  const anyEntryExpanded = useBoundStore((state) => state.anyEntryExpanded);

  useInput(
    (_, key) => {
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
