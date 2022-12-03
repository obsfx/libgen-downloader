import React from "react";
import { useFocus } from "ink";
import { useListItems } from "../../hooks/useListItems";
import { RESULT_LIST_ACTIVE_LIST_INDEX } from "../../../constants";
import ResultListItemOption from "./ResultListItemOption";
import ResultListItemEntry from "./ResultListItemEntry";
import { ResultListItemType } from "../../../api/models/ListItem";
import ContentContainer from "../../components/ContentContainer";
import { useScrollableListControls } from "../../hooks/useScrollableListControls";
import { useAppContext } from "../../contexts/AppContext";

const ResultList: React.FC = () => {
  const { anyEntryExpanded } = useAppContext();
  const { listItems, setListItems, renderedItems } = useListItems();

  const { isFocused } = useFocus({ autoFocus: true });
  useScrollableListControls(listItems, setListItems, isFocused && !anyEntryExpanded);

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
