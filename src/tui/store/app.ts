import { atom } from "jotai";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { constructListItems } from "../../utils";
import { AppEvent, EventManager } from "../classes/EventEmitterManager";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";

export const isLoadingAtom = atom(false);
export const anyEntryExpandedAtom = atom(false);

export const loaderMessageAtom = atom("");
export const searchValueAtom = atom("");

export const currentPageAtom = atom(1);
export const activeExpandedListLengthAtom = atom(0);
export const listItemsCursorAtom = atom(0);

export const filtersAtom = atom<FilterRecord>({} as FilterRecord);
export const detailedEntryAtom = atom<Entry | null>(null);

export const entriesAtom = atom<Entry[]>([]);
export const cachedNextPageEntriesAtom = atom<Entry[]>([]);
export const listItemsAtom = atom<ListItem[]>((get) => {
  const entries = get(entriesAtom);
  const cachedNextPageEntries = get(cachedNextPageEntriesAtom);
  const currentPage = get(currentPageAtom);

  const handleSearchOption = () => {
    EventManager.emit(AppEvent.BACK_TO_SEARCH);
  };

  const handleNextPageOption = () => {
    EventManager.emit(AppEvent.NEXT_PAGE);
  };

  const handlePrevPageOption = () => {
    EventManager.emit(AppEvent.PREV_PAGE);
  };

  const handleStartBulkDownloadOption = () => {
    EventManager.emit(AppEvent.START_BULK_DOWNLOAD);
  };

  const handleExitOption = () => {
    EventManager.emit(AppEvent.EXIT);
  };

  return constructListItems({
    entries,
    currentPage,
    nextPageEntries: cachedNextPageEntries,
    handleSearchOption,
    handleNextPageOption,
    handlePrevPageOption,
    handleStartBulkDownloadOption,
    handleExitOption,
  });
});

export const showSearchMinCharWarningAtom = atom((get) => {
  const searchValue = get(searchValueAtom);
  return searchValue.length < 3;
});

export const activeLayoutAtom = atom("");

export const errorMessageAtom = atom<string | null>(null);
