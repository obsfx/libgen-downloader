import React from "react";
import { Box, useFocus } from "ink";
import { RESULT_LIST_ACTIVE_LIST_INDEX } from "../../../constants";
import ResultListItemOption from "./ResultListItemOption";
import ResultListItemEntry from "./ResultListItemEntry";
import { ResultListItemType } from "../../../api/models/ListItem";
import ContentContainer from "../../components/ContentContainer";
import { useScrollableListControls } from "../../hooks/useScrollableListControls";
import { useAppContext } from "../../contexts/AppContext";
import { getRenderedListItems } from "../../../utils";
import UsageInfo from "../../components/UsageInfo";

const ResultList: React.FC = () => {
  const { anyEntryExpanded, activeExpandedListLength, listItems, setListItems } = useAppContext();
  const { isFocused } = useFocus({ autoFocus: true });
  useScrollableListControls(listItems, setListItems, isFocused && !anyEntryExpanded);
  const renderedItems = getRenderedListItems(listItems, anyEntryExpanded, activeExpandedListLength);

  return (
    <Box flexDirection="column">
      <ContentContainer>
        {renderedItems.map((item, index) =>
          item.type === ResultListItemType.Option ? (
            <ResultListItemOption
              key={item.data.id}
              item={item}
              isActive={index === RESULT_LIST_ACTIVE_LIST_INDEX}
            />
          ) : (
            <ResultListItemEntry
              key={item.data.id}
              item={item}
              isActive={index === RESULT_LIST_ACTIVE_LIST_INDEX}
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
