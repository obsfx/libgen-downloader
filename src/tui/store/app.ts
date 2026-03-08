import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/entry";
import { ListItem } from "../../api/models/list-item";
import { constructListItems, NextPageStatus } from "../../utilities";
import { LAYOUT_KEY } from "../layouts/keys";
import { clearScreen } from "../helpers/screen";

export type MirrorCheckStatus = "pending" | "checking" | "ok" | "failed";

export interface MirrorCheckState {
  src: string;
  status: MirrorCheckStatus;
}

export interface IAppState {
  CLIMode: boolean;

  isLoading: boolean;
  anyEntryExpanded: boolean;
  showSearchMinCharWarning: boolean;

  loaderMessage: string;
  searchValue: string;
  errorMessage: string | undefined;
  warningMessage: string | undefined;
  warningTimeout: NodeJS.Timeout | undefined;

  currentPage: number;
  activeExpandedListLength: number;
  listItemsCursor: number;

  detailedEntry: Entry | undefined;
  entries: Entry[];
  listItems: ListItem[];
  activeLayout: LAYOUT_KEY;

  nextPageStatus: NextPageStatus;
  connectionError: string | undefined;
  mirrorCheckStates: MirrorCheckState[];

  setCLIMode: (CLIMode: boolean) => void;

  setIsLoading: (isLoading: boolean) => void;
  setAnyEntryExpanded: (anyEntryExpanded: boolean) => void;

  setLoaderMessage: (loaderMessage: string) => void;
  setSearchValue: (searchValue: string) => void;
  setErrorMessage: (errorMessage: string | undefined) => void;
  setWarningMessage: (warningMessage: string | undefined) => void;

  setCurrentPage: (currentPage: number) => void;
  setActiveExpandedListLength: (activeExpandedListLength: number) => void;
  setListItemsCursor: (listItemsCursor: number) => void;

  setDetailedEntry: (detailedEntry: Entry | undefined) => void;
  setEntries: (entries: Entry[]) => void;
  setActiveLayout: (activeLayout: LAYOUT_KEY) => void;

  setNextPageStatus: (nextPageStatus: NextPageStatus) => void;
  setConnectionError: (connectionError: string | undefined) => void;
  setMirrorCheckStates: (mirrorCheckStates: MirrorCheckState[]) => void;

  resetAppState: () => void;
}

export const initialAppState = {
  isLoading: false,
  anyEntryExpanded: false,
  showSearchMinCharWarning: true,

  loaderMessage: "",
  searchValue: "",
  errorMessage: undefined,
  warningMessage: undefined,
  warningTimeout: undefined,

  currentPage: 1,
  activeExpandedListLength: 0,
  listItemsCursor: 0,

  detailedEntry: undefined,
  entries: [],
  listItems: [],
  activeLayout: LAYOUT_KEY.SEARCH_LAYOUT,

  nextPageStatus: "idle" as NextPageStatus,
  connectionError: undefined as string | undefined,
  mirrorCheckStates: [] as MirrorCheckState[],
};

export const createAppStateSlice = (
  set: (partial: Partial<TCombinedStore> | ((state: TCombinedStore) => Partial<TCombinedStore>)) => void,
  get: () => TCombinedStore
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
  setErrorMessage: (errorMessage: string | undefined) => set({ errorMessage }),
  setWarningMessage: (warningMessage: string | undefined) => {
    const WARNING_DURATION = 5000;

    const timeout = get().warningTimeout;
    if (timeout) {
      clearTimeout(timeout);
    }

    set({ warningMessage });
    const newTimeout = setTimeout(() => {
      set({ warningMessage: undefined });
    }, WARNING_DURATION);
    set({ warningTimeout: newTimeout });
  },

  setCurrentPage: (currentPage: number) => set({ currentPage }),
  setActiveExpandedListLength: (activeExpandedListLength: number) =>
    set({ activeExpandedListLength }),
  setListItemsCursor: (listItemsCursor: number) => set({ listItemsCursor }),

  setDetailedEntry: (detailedEntry: Entry | undefined) => set({ detailedEntry }),
  setEntries: (entries: Entry[]) => {
    const store = get();
    const listItems = constructListItems({
      entries,
      currentPage: store.currentPage,
      nextPageStatus: store.nextPageStatus,
      handleSearchOption: store.backToSearch,
      handleNextPageOption: store.nextPage,
      handleRetryNextPageOption: () => {
        store.checkNextPage(store.searchValue, store.currentPage + 1);
      },
      handlePrevPageOption: store.prevPage,
      handleStartBulkDownloadOption: store.startBulkDownload,
      handleExitOption: () => {
        if (get().inDownloadQueueEntryIds.length > 0) {
          store.setActiveLayout(LAYOUT_KEY.DOWNLOAD_QUEUE_BEFORE_EXIT_LAYOUT);
          return;
        }

        if (Object.keys(get().bulkDownloadSelectedEntries).length > 0) {
          store.setActiveLayout(LAYOUT_KEY.BULK_DOWNLOAD_BEFORE_EXIT_LAYOUT);
          return;
        }

        store.handleExit();
      },
    });
    set({ entries, listItems });
  },
  setActiveLayout: (activeLayout: LAYOUT_KEY) => {
    const store = get();
    if (!store.CLIMode) {
      clearScreen();
    }

    set({ activeLayout });
  },

  setNextPageStatus: (nextPageStatus: NextPageStatus) => set({ nextPageStatus }),
  setConnectionError: (connectionError: string | undefined) => set({ connectionError }),
  setMirrorCheckStates: (mirrorCheckStates: MirrorCheckState[]) => set({ mirrorCheckStates }),

  resetAppState: () => set(initialAppState),
});
