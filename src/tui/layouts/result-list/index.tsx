import React from "react";
import { Box, useFocus } from "ink";
import { RESULT_LIST_ACTIVE_LIST_INDEX } from "../../../constants.js";
import ResultListItemOption from "./ResultListItemOption.js";
import ResultListItemEntry from "./ResultListItemEntry.js";
import { IResultListItemType } from "../../../api/models/ListItem.js";
import ContentContainer from "../../components/ContentContainer.js";
import { useScrollableListControls } from "../../hooks/useScrollableListControls.js";
import { getRenderedListItems } from "../../../utils.js";
import UsageInfo from "../../components/UsageInfo.js";
import ResultListInfo from "../../components/ResultListInfo.js";
import { useBoundStore } from "../../store/index.js";

const ResultList: React.FC = () => {
  const anyEntryExpanded = useBoundStore((state) => state.anyEntryExpanded);
  const activeExpandedListLength = useBoundStore((state) => state.activeExpandedListLength);
  const listItems = useBoundStore((state) => state.listItems);
  const listItemsCursor = useBoundStore((state) => state.listItemsCursor);
  const setListItemsCursor = useBoundStore((state) => state.setListItemsCursor);

  const { isFocused } = useFocus({ autoFocus: true });
  useScrollableListControls(
    listItemsCursor,
    setListItemsCursor,
    listItems.length,
    isFocused && !anyEntryExpanded
  );
  const renderedItems = getRenderedListItems(
    listItemsCursor,
    listItems,
    anyEntryExpanded,
    activeExpandedListLength
  );

  const activeListIndex =
    renderedItems.length - 1 < RESULT_LIST_ACTIVE_LIST_INDEX ? 1 : RESULT_LIST_ACTIVE_LIST_INDEX;

  return (
    <Box flexDirection="column">
      <ResultListInfo />
      <ContentContainer>
        {renderedItems.map((item, index) =>
          item.type === IResultListItemType.Option ? (
            <ResultListItemOption
              key={item.data.id}
              item={item}
              isActive={index === activeListIndex}
            />
          ) : (
            <ResultListItemEntry
              key={item.data.id}
              item={item}
              isActive={index === activeListIndex}
              isExpanded={index === RESULT_LIST_ACTIVE_LIST_INDEX && anyEntryExpanded}
              isFadedOut={index !== RESULT_LIST_ACTIVE_LIST_INDEX && anyEntryExpanded}
            />
          )
        )}
      </ContentContainer>
      <UsageInfo />
    </Box>
  );
};

export default ResultList;
