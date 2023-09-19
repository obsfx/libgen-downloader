import { StateCreator } from "zustand";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { ListItem } from "../../api/models/ListItem.js";
import { constructListItems } from "../../utils.js";
import { LAYOUT_KEY } from "../layouts/keys.js";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data.js";

export interface IAppState {
  isLoading: boolean;
  anyEntryExpanded: boolean;
  showSearchMinCharWarning: boolean;

  loaderMessage: string;
  searchValue: string;
  errorMessage: string | null;

  currentPage: number;
  activeExpandedListLength: number;
  listItemsCursor: number;

  filters: FilterRecord;
  detailedEntry: Entry | null;
  entries: Entry[];
  cachedNextPageEntries: Entry[];
  listItems: ListItem[];
  activeLayout: LAYOUT_KEY;

  setIsLoading: (isLoading: boolean) => void;
  setAnyEntryExpanded: (anyEntryExpanded: boolean) => void;

  setLoaderMessage: (loaderMessage: string) => void;
  setSearchValue: (searchValue: string) => void;
  setErrorMessage: (errorMessage: string | null) => void;

  setCurrentPage: (currentPage: number) => void;
  setActiveExpandedListLength: (activeExpandedListLength: number) => void;
  setListItemsCursor: (listItemsCursor: number) => void;

  setFilters: (filters: FilterRecord) => void;
  setDetailedEntry: (detailedEntry: Entry | null) => void;
  setEntries: (entries: Entry[]) => void;
  setCachedNextPageEntries: (cachedNextPageEntries: Entry[]) => void;
  setActiveLayout: (activeLayout: LAYOUT_KEY) => void;

  resetAppState: () => void;
}

export const initialAppState = {
  isLoading: false,
  anyEntryExpanded: false,
  showSearchMinCharWarning: true,

  loaderMessage: "",
  searchValue: "",
  errorMessage: null,

  currentPage: 1,
  activeExpandedListLength: 0,
  listItemsCursor: 0,

  filters: {} as FilterRecord,
  detailedEntry: null,
  entries: [],
  cachedNextPageEntries: [],
  listItems: [],
  activeLayout: LAYOUT_KEY.SEARCH_LAYOUT,
};

export const createAppStateSlice: StateCreator<TCombinedStore, [], [], IAppState> = (set, get) => ({
  ...initialAppState,

  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setAnyEntryExpanded: (anyEntryExpanded: boolean) => set({ anyEntryExpanded }),

  setLoaderMessage: (loaderMessage: string) => set({ loaderMessage }),
  setSearchValue: (searchValue: string) => {
    set(() => ({ showSearchMinCharWarning: searchValue.length < 3 }));
    set({ searchValue });
  },
  setErrorMessage: (errorMessage: string | null) => set({ errorMessage }),

  setCurrentPage: (currentPage: number) => set({ currentPage }),
  setActiveExpandedListLength: (activeExpandedListLength: number) =>
    set({ activeExpandedListLength }),
  setListItemsCursor: (listItemsCursor: number) => set({ listItemsCursor }),

  setFilters: (filters: FilterRecord) => set({ filters }),
  setDetailedEntry: (detailedEntry: Entry | null) => set({ detailedEntry }),
  setEntries: (entries: Entry[]) => {
    const store = get();
    const listItems = constructListItems({
      entries,
      currentPage: store.currentPage,
      nextPageEntries: store.cachedNextPageEntries,
      handleSearchOption: () => store.search(store.searchValue, store.currentPage + 1),
      handleNextPageOption: store.nextPage,
      handlePrevPageOption: store.prevPage,
      handleStartBulkDownloadOption: () => {
        console.log("start bulk download");
      },
      handleExitOption: () => {
        console.log("exit");
      },
    });
    set({ entries, listItems });
  },
  setCachedNextPageEntries: (cachedNextPageEntries: Entry[]) => set({ cachedNextPageEntries }),
  setActiveLayout: (activeLayout: LAYOUT_KEY) => set({ activeLayout }),

  resetAppState: () => set(initialAppState),
});

//const entriesAtom = atom<Entry[]>([]);
//export const readWriteEntriesAtom = atom(
//  (get) => get(entriesAtom),
//  (get, set, entries: Entry[]) => {
//    const cachedNextPageEntries = get(cachedNextPageEntriesAtom);
//    const currentPage = get(currentPageAtom);
//
//    const handleSearchOption = () => {
//      EventManager.emit(AppEvent.BACK_TO_SEARCH);
//    };
//
//    const handleNextPageOption = () => {
//      EventManager.emit(AppEvent.NEXT_PAGE);
//    };
//
//    const handlePrevPageOption = () => {
//      EventManager.emit(AppEvent.PREV_PAGE);
//    };
//
//    const handleStartBulkDownloadOption = () => {
//      EventManager.emit(AppEvent.START_BULK_DOWNLOAD);
//    };
//
//    const handleExitOption = () => {
//      EventManager.emit(AppEvent.EXIT);
//    };
//
//    const listItems = constructListItems({
//      entries,
//      currentPage,
//      nextPageEntries: cachedNextPageEntries,
//      handleSearchOption,
//      handleNextPageOption,
//      handlePrevPageOption,
//      handleStartBulkDownloadOption,
//      handleExitOption,
//    });
//    set(listItemsAtom, listItems);
//  }
//);
//
//export const cachedNextPageEntriesAtom = atom<Entry[]>([]);
//export const listItemsAtom = atom<ListItem[]>([]);
//export const readWriteListItemsAtom = atom<ListItem[], [Entry[]], void>(
//  (get) => get(listItemsAtom),
//  (get, set, entries: Entry[]) => {
//    const cachedNextPageEntries = get(cachedNextPageEntriesAtom);
//    const currentPage = get(currentPageAtom);
//
//    const handleSearchOption = () => {
//      EventManager.emit(AppEvent.BACK_TO_SEARCH);
//    };
//
//    const handleNextPageOption = () => {
//      EventManager.emit(AppEvent.NEXT_PAGE);
//    };
//
//    const handlePrevPageOption = () => {
//      EventManager.emit(AppEvent.PREV_PAGE);
//    };
//
//    const handleStartBulkDownloadOption = () => {
//      EventManager.emit(AppEvent.START_BULK_DOWNLOAD);
//    };
//
//    const handleExitOption = () => {
//      EventManager.emit(AppEvent.EXIT);
//    };
//
//    return constructListItems({
//      entries,
//      currentPage,
//      nextPageEntries: cachedNextPageEntries,
//      handleSearchOption,
//      handleNextPageOption,
//      handlePrevPageOption,
//      handleStartBulkDownloadOption,
//      handleExitOption,
//    });
//  }
//);
//
//export const showSearchMinCharWarningAtom = atom((get) => {
//  const searchValue = get(searchValueAtom);
//  return searchValue.length < 3;
//});
//
//export const activeLayoutAtom = atom("");
//
//export const errorMessageAtom = atom<string | null>(null);
