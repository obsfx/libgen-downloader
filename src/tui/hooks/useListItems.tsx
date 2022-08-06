import { useCallback, useEffect, useMemo } from "react";
import { useAppContext } from "../contexts/AppContext";
import {
  ListEntryOptions,
  OPTION_EXIT_ID,
  OPTION_EXIT_LABEL,
  OPTION_NEXT_PAGE_ID,
  OPTION_NEXT_PAGE_LABEL,
  OPTION_SEARCH_ID,
  OPTION_SEARCH_LABEL,
  OPTION_START_BULK_DOWNLOAD_ID,
  OPTION_START_BULK_DOWNLOAD_LABEL,
  RESULT_LIST_ACTIVE_LIST_INDEX,
  RESULT_LIST_LENGTH,
  SEARCH_LAYOUT,
} from "../../constants";
import { useLayoutContext } from "../contexts/LayoutContext";
import { ListItem, ResultListItemType } from "../../api/models/ListItem";
import { createOptionItem } from "../../utils";

export const useListItems = (expandedView: boolean) => {
  const { entries, resetAppState, listItems, setListItems } = useAppContext();
  const { setActiveLayout } = useLayoutContext();

  const handleSearchOption = useCallback(() => {
    resetAppState();
    setActiveLayout(SEARCH_LAYOUT);
  }, [resetAppState, setActiveLayout]);

  const handleNextPageOption = useCallback(() => {
    return undefined;
  }, []);
  const handleStartBulkDownloadOption = useCallback(() => {
    return undefined;
  }, []);
  const handleExitOption = useCallback(() => {
    return undefined;
  }, []);

  useEffect(() => {
    const entryListItems: ListItem[] = entries.map<ListItem>((entry, idx) => ({
      type: ResultListItemType.Entry,
      data: entry,
      order:
        ((idx + 1 + (entries.length - (RESULT_LIST_ACTIVE_LIST_INDEX + 1))) % entries.length) + 1,
    }));

    setListItems([
      ...entryListItems.slice(0, RESULT_LIST_ACTIVE_LIST_INDEX),
      createOptionItem(OPTION_SEARCH_ID, OPTION_SEARCH_LABEL, handleSearchOption),
      createOptionItem(OPTION_NEXT_PAGE_ID, OPTION_NEXT_PAGE_LABEL, handleNextPageOption),
      createOptionItem(
        OPTION_START_BULK_DOWNLOAD_ID,
        OPTION_START_BULK_DOWNLOAD_LABEL,
        handleStartBulkDownloadOption
      ),
      createOptionItem(OPTION_EXIT_ID, OPTION_EXIT_LABEL, handleExitOption),
      ...entryListItems.slice(RESULT_LIST_ACTIVE_LIST_INDEX, entryListItems.length),
    ]);
  }, [
    entries,
    setListItems,
    resetAppState,
    setActiveLayout,
    handleSearchOption,
    handleNextPageOption,
    handleStartBulkDownloadOption,
    handleExitOption,
  ]);

  const renderedItems = useMemo(() => {
    const limit = expandedView
      ? RESULT_LIST_LENGTH - Object.keys(ListEntryOptions).length
      : RESULT_LIST_LENGTH;
    return listItems.slice(0, limit);
  }, [listItems, expandedView]);

  return {
    listItems,
    renderedItems,
    setListItems,
  };
};
