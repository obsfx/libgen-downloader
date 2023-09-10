import React from "react";
import { Box, useFocus } from "ink";
import { RESULT_LIST_ACTIVE_LIST_INDEX } from "../../../constants";
import ResultListItemOption from "./ResultListItemOption";
import ResultListItemEntry from "./ResultListItemEntry";
import { IResultListItemType } from "../../../api/models/ListItem";
import ContentContainer from "../../components/ContentContainer";
import { useScrollableListControls } from "../../hooks/useScrollableListControls";
import { getRenderedListItems } from "../../../utils";
import UsageInfo from "../../components/UsageInfo";
import ResultListInfo from "../../components/ResultListInfo";
import { useAtom } from "jotai";
import {
  activeExpandedListLengthAtom,
  anyEntryExpandedAtom,
  listItemsAtom,
  listItemsCursorAtom,
} from "../../store/app";

const ResultList: React.FC = () => {
  const [anyEntryExpanded] = useAtom(anyEntryExpandedAtom);
  const [activeExpandedListLength] = useAtom(activeExpandedListLengthAtom);
  const [listItems] = useAtom(listItemsAtom);
  const [listItemsCursor, setListItemsCursor] = useAtom(listItemsCursorAtom);

  const { isFocused } = useFocus({ autoFocus: true });
  useScrollableListControls(setListItemsCursor, listItems.length, isFocused && !anyEntryExpanded);
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
