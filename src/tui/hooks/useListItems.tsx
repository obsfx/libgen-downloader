import { useCallback, useEffect, useMemo } from "react";
import { useAppContext } from "../contexts/AppContext";
import {
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

export const useListItems = () => {
  const { entries, resetAppState, listItems, setListItems } = useAppContext();
  const { setActiveLayout } = useLayoutContext();

  const createOptionItem = useCallback<
    (id: string, label: string, onSelect: () => void) => ListItem
      >(
      (id: string, label: string, onSelect: () => void) => ({
        type: ResultListItemType.Option,
        data: {
          id,
          label,
          onSelect,
        },
      }),
      []
      );

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
    const entryListItems: ListItem[] = entries.map<ListItem>((entry) => ({
      type: ResultListItemType.Entry,
      data: entry,
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
    createOptionItem,
    handleSearchOption,
    handleNextPageOption,
    handleStartBulkDownloadOption,
    handleExitOption,
  ]);

  const renderedItems = useMemo(() => {
    return listItems.slice(0, RESULT_LIST_LENGTH);
  }, [listItems]);

  return {
    listItems,
    renderedItems,
    setListItems,
  };
};
