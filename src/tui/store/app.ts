import { GetState, SetState } from "zustand";
import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { constructListItems } from "../../utils";
import { LAYOUT_KEY } from "../layouts/keys";

export interface IAppState {
  CLIMode: boolean;

  isLoading: boolean;
  anyEntryExpanded: boolean;
  showSearchMinCharWarning: boolean;

  loaderMessage: string;
  searchValue: string;
  selectedSearchByOption: string | null;
  errorMessage: string | null;
  warningMessage: string | null;
  warningTimeout: NodeJS.Timeout | null;

  currentPage: number;
  activeExpandedListLength: number;
  listItemsCursor: number;

  detailedEntry: Entry | null;
  entries: Entry[];
  listItems: ListItem[];
  activeLayout: LAYOUT_KEY;

  setCLIMode: (CLIMode: boolean) => void;

  setIsLoading: (isLoading: boolean) => void;
  setAnyEntryExpanded: (anyEntryExpanded: boolean) => void;

  setLoaderMessage: (loaderMessage: string) => void;
  setSearchValue: (searchValue: string) => void;
  setSelectedSearchByOption: (selectedSearchByOption: string | null) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  setWarningMessage: (warningMessage: string | null) => void;

  setCurrentPage: (currentPage: number) => void;
  setActiveExpandedListLength: (activeExpandedListLength: number) => void;
  setListItemsCursor: (listItemsCursor: number) => void;

  setDetailedEntry: (detailedEntry: Entry | null) => void;
  setEntries: (entries: Entry[]) => void;
  setActiveLayout: (activeLayout: LAYOUT_KEY) => void;

  resetAppState: () => void;
}

export const initialAppState = {
  isLoading: false,
  anyEntryExpanded: false,
  showSearchMinCharWarning: true,

  loaderMessage: "",
  searchValue: "",
  selectedSearchByOption: null,
  errorMessage: null,
  warningMessage: null,
  warningTimeout: null,

  currentPage: 1,
  activeExpandedListLength: 0,
  listItemsCursor: 0,

  detailedEntry: null,
  entries: [],
  listItems: [],
  activeLayout: LAYOUT_KEY.SEARCH_LAYOUT,
};

export const createAppStateSlice = (
  set: SetState<TCombinedStore>,
  get: GetState<TCombinedStore>
) => ({
  CLIMode: false,
  setCLIMode: (CLIMode: boolean) => set({ CLIMode }),

  ...initialAppState,

  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setAnyEntryExpanded: (anyEntryExpanded: boolean) => set({ anyEntryExpanded }),

  setLoaderMessage: (loaderMessage: string) => set({ loaderMessage }),
  setSearchValue: (searchValue: string) => {
    set(() => ({ showSearchMinCharWarning: searchValue.length < 3 }));
    set({ searchValue });
  },
  setSelectedSearchByOption: (selectedSearchByOption: string | null) => {
    set({ selectedSearchByOption });
  },
  setErrorMessage: (errorMessage: string | null) => set({ errorMessage }),
  setWarningMessage: (warningMessage: string | null) => {
    const WARNING_DURATION = 5000;

    const timeout = get().warningTimeout;
    if (timeout) {
      clearTimeout(timeout);
    }

    set({ warningMessage });
    const newTimeout = setTimeout(() => {
      set({ warningMessage: null });
    }, WARNING_DURATION);
    set({ warningTimeout: newTimeout });
  },

  setCurrentPage: (currentPage: number) => set({ currentPage }),
  setActiveExpandedListLength: (activeExpandedListLength: number) =>
    set({ activeExpandedListLength }),
  setListItemsCursor: (listItemsCursor: number) => set({ listItemsCursor }),

  setDetailedEntry: (detailedEntry: Entry | null) => set({ detailedEntry }),
  setEntries: (entries: Entry[]) => {
    const store = get();
    const listItems = constructListItems({
      entries,
      currentPage: store.currentPage,
      isNextPageAvailable: store.lookupPageCache(store.currentPage + 1).length > 0,
      handleSearchOption: store.backToSearch,
      handleNextPageOption: store.nextPage,
      handlePrevPageOption: store.prevPage,
      handleStartBulkDownloadOption: store.startBulkDownload,
      handleExitOption: () => {
        if (get().inDownloadQueueEntryIds.length > 0) {
          store.setActiveLayout(LAYOUT_KEY.DOWNLOAD_QUEUE_BEFORE_EXIT_LAYOUT);
          return;
        }

        if (get().bulkDownloadSelectedEntryIds.length > 0) {
          store.setActiveLayout(LAYOUT_KEY.BULK_DOWNLOAD_BEFORE_EXIT_LAYOUT);
          return;
        }

        store.handleExit();
      },
    });
    set({ entries, listItems });
  },
  setActiveLayout: (activeLayout: LAYOUT_KEY) => set({ activeLayout }),

  resetAppState: () => set(initialAppState),
});
