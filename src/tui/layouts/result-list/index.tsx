import type { FC } from "react";
import { Box } from "ink";
import { RESULT_LIST_ACTIVE_LIST_INDEX } from "../../../constants";
import ResultListItemOption from "./result-list-item-option";
import ResultListItemEntry from "./result-list-item-entry";
import { IResultListItemType } from "../../../api/models/list-item";
import ContentContainer from "../../components/content-container";
import { useScrollableListControls } from "../../hooks/use-scrollable-list-controls";
import { getRenderedListItems } from "../../../utilities";
import UsageInfo from "../../components/usage-info";
import ResultListInfo from "../../components/result-list-info";
import { useBoundStore } from "../../store";
import { ResultListLoadingSkeleton } from "./result-list-loading-skeleton";

const ResultList: FC = () => {
  const anyEntryExpanded = useBoundStore((state) => state.anyEntryExpanded);
  const activeExpandedListLength = useBoundStore((state) => state.activeExpandedListLength);
  const listItems = useBoundStore((state) => state.listItems);
  const listItemsCursor = useBoundStore((state) => state.listItemsCursor);
  const setListItemsCursor = useBoundStore((state) => state.setListItemsCursor);
  const isLoading = useBoundStore((state) => state.isLoading);

  useScrollableListControls(
    listItemsCursor,
    setListItemsCursor,
    listItems.length,
    !anyEntryExpanded
  );

  const renderedItems = getRenderedListItems(
    listItemsCursor,
    listItems,
    anyEntryExpanded,
    activeExpandedListLength
  );

  let activeListIndex = RESULT_LIST_ACTIVE_LIST_INDEX;
  if (renderedItems.length - 1 < RESULT_LIST_ACTIVE_LIST_INDEX) {
    activeListIndex = 1;
  }

  return (
    <Box flexDirection="column">
      <ResultListInfo />
      {isLoading && <ResultListLoadingSkeleton />}
      {!isLoading && (
        <ContentContainer>
          {renderedItems.map((item, index) => {
            if (item.type === IResultListItemType.Option) {
              return (
                <ResultListItemOption
                  key={item.data.id}
                  item={item}
                  isActive={index === activeListIndex}
                />
              );
            }

            return (
              <ResultListItemEntry
                key={item.data.id}
                item={item}
                isActive={index === activeListIndex}
                isExpanded={index === RESULT_LIST_ACTIVE_LIST_INDEX && anyEntryExpanded}
                isFadedOut={index !== RESULT_LIST_ACTIVE_LIST_INDEX && anyEntryExpanded}
              />
            );
          })}
        </ContentContainer>
      )}
      <UsageInfo />
    </Box>
  );
};

export default ResultList;
