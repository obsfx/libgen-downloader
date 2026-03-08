import type { FC } from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";

import { IResultListItemOption } from "../../../api/models/list-item";
import { useBoundStore } from "../../store/index";
import Spinner from "../../components/spinner";

const ResultListItemOption: FC<{
  item: IResultListItemOption;
  isActive: boolean;
}> = ({ item, isActive }) => {
  const anyEntryExpanded = useBoundStore((state) => state.anyEntryExpanded);
  const { disabled, showSpinner } = item.data;

  useInput(
    (_, key) => {
      if (key.return && !disabled) {
        item.data.onSelect();
      }
    },
    { isActive }
  );

  let color = "yellow";
  if (disabled) {
    color = "gray";
  } else if (anyEntryExpanded) {
    color = "gray";
  } else if (isActive) {
    color = "cyanBright";
  }

  let pointer = " ";
  if (isActive) {
    pointer = figures.pointer;
  }

  return (
    <Box>
      <Text wrap="truncate" color={color} bold={isActive && !disabled}>
        {pointer} {item.data.label}
      </Text>
      {showSpinner && (
        <Text color="gray">
          {" "}
          <Spinner />
        </Text>
      )}
    </Box>
  );
};

export default ResultListItemOption;
