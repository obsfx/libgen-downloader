import { useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import {
  OPTION_EXIT_ID,
  OPTION_EXIT_LABEL,
  OPTION_NEXT_PAGE_ID,
  OPTION_NEXT_PAGE_LABEL,
  OPTION_PREV_PAGE_ID,
  OPTION_PREV_PAGE_LABEL,
  OPTION_SEARCH_ID,
  OPTION_SEARCH_LABEL,
  OPTION_START_BULK_DOWNLOAD_ID,
  OPTION_START_BULK_DOWNLOAD_LABEL,
  RESULT_LIST_ACTIVE_LIST_INDEX,
  RESULT_LIST_LENGTH,
} from "../../constants";
import { useLayoutContext } from "../contexts/LayoutContext";
import { ListItem, ResultListItemType } from "../../api/models/ListItem";
import { createOptionItem } from "../../utils";
import { useResultListContext } from "../contexts/ResultListContext";

export const useListItems = () => {
  const {
    entries,
    resetAppState,
    listItems,
    setListItems,
    listItemsInitialized,
    setListItemsInitialized,
    anyEntryExpanded,
    activeExpandedListLength,
    currentPage,
    cachedNextPageEntries,
  } = useAppContext();

  const {
    handleSearchOption,
    handleNextPageOption,
    handlePrevPageOption,
    handleStartBulkDownloadOption,
    handleExitOption,
  } = useResultListContext();

  const { setActiveLayout } = useLayoutContext();

  useEffect(() => {
    if (listItemsInitialized) {
      return;
    }

    const entryListItems: ListItem[] = entries.map<ListItem>((entry, idx) => ({
      type: ResultListItemType.Entry,
      data: entry,
      order: idx + 1,
    }));

    setListItems([
      ...entryListItems.slice(
        entryListItems.length - RESULT_LIST_ACTIVE_LIST_INDEX,
        entryListItems.length
      ),
      createOptionItem(OPTION_SEARCH_ID, OPTION_SEARCH_LABEL, handleSearchOption),
      ...(cachedNextPageEntries.length > 0
        ? [createOptionItem(OPTION_NEXT_PAGE_ID, OPTION_NEXT_PAGE_LABEL, handleNextPageOption)]
        : []),
      ...(currentPage > 1
        ? [createOptionItem(OPTION_PREV_PAGE_ID, OPTION_PREV_PAGE_LABEL, handlePrevPageOption)]
        : []),
      createOptionItem(
        OPTION_START_BULK_DOWNLOAD_ID,
        OPTION_START_BULK_DOWNLOAD_LABEL,
        handleStartBulkDownloadOption
      ),
      createOptionItem(OPTION_EXIT_ID, OPTION_EXIT_LABEL, handleExitOption),
      ...entryListItems.slice(0, entryListItems.length - RESULT_LIST_ACTIVE_LIST_INDEX),
    ]);

    setListItemsInitialized(true);
  }, [
    entries,
    setListItems,
    listItemsInitialized,
    setListItemsInitialized,
    resetAppState,
    setActiveLayout,
    handleSearchOption,
    handleNextPageOption,
    handlePrevPageOption,
    handleStartBulkDownloadOption,
    handleExitOption,
    currentPage,
    cachedNextPageEntries.length,
  ]);

  const renderedItemsLimit = Math.max(
    5,
    anyEntryExpanded ? RESULT_LIST_LENGTH - activeExpandedListLength : RESULT_LIST_LENGTH
  );
  const renderedItems = listItems.slice(0, renderedItemsLimit);

  return {
    listItems,
    renderedItems,
    setListItems,
  };
};
