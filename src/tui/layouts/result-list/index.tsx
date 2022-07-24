import React from "react";
import { Box, Text, useInput, Key, useFocus } from "ink";
import { RESULT_LIST_FOCUS_ID } from "../../../constants/layouts";
import { ResultListItem, useListItems } from "../../hooks/useListItems";
import { RESULT_LIST_ACTIVE_LIST_INDEX } from "../../../constants/options";

const ResultList: React.FC = () => {
  const { listItems, renderedItems, setListItems } = useListItems();

  const { isFocused } = useFocus({ id: RESULT_LIST_FOCUS_ID });

  useInput(
    (input: string, key: Key) => {
      if (input.toLowerCase() === "j" || key.downArrow) {
        setListItems([...listItems.slice(1, listItems.length), listItems[0]]);
      } else if (input.toLowerCase() === "k" || key.upArrow) {
        setListItems([
          listItems[listItems.length - 1],
          ...listItems.slice(0, listItems.length - 1),
        ]);
      }
    },
    {
      isActive: isFocused,
    }
  );

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="grey"
      width="100%"
      paddingLeft={1}
      paddingRight={1}
    >
      {renderedItems.map((item, index) =>
        item.type === ResultListItem.Option ? (
          <Text
            key={item.data.id + item.data.label}
            wrap="truncate"
            color={index === RESULT_LIST_ACTIVE_LIST_INDEX ? "green" : "gray"}
            bold={index === RESULT_LIST_ACTIVE_LIST_INDEX}
          >
            {item.data.label}
          </Text>
        ) : (
          <Text
            key={item.data.id + item.data.title}
            wrap="truncate"
            color={index === RESULT_LIST_ACTIVE_LIST_INDEX ? "green" : "gray"}
            bold={index === RESULT_LIST_ACTIVE_LIST_INDEX}
          >
            {item.data.title}
          </Text>
        )
      )}
    </Box>
  );
};

export default ResultList;
