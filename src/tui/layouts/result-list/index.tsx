import React from "react";
import { useInput, Key, useFocus } from "ink";
import { useListItems } from "../../hooks/useListItems";
import { RESULT_LIST_ACTIVE_LIST_INDEX } from "../../../constants";
import ResultListItemOption from "./ResultListItemOption";
import ResultListItemEntry from "./ResultListItemEntry";
import { ResultListItemType } from "../../../api/models/ListItem";
import { useResultListContext } from "../../contexts/ResultListContext";
import ContentContainer from "../../components/ContentContainer";

const ResultList: React.FC = () => {
  const { anyEntryExpanded } = useResultListContext();
  const { listItems, setListItems, renderedItems } = useListItems();

  const { isFocused } = useFocus({ autoFocus: true });

  useInput(
    (input: string, key: Key) => {
      if (input.toLowerCase() === "j" || key.downArrow) {
        setListItems([...listItems.slice(1, listItems.length), listItems[0]]);
        return;
      }

      if (input.toLowerCase() === "k" || key.upArrow) {
        setListItems([
          listItems[listItems.length - 1],
          ...listItems.slice(0, listItems.length - 1),
        ]);
        return;
      }
    },
    {
      isActive: isFocused && !anyEntryExpanded,
    }
  );

  return (
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
  );
};

export default ResultList;
