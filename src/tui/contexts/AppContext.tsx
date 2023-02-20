import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { constructListItems } from "../../utils";
import { useSearch } from "../hooks/useSearch";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";
import { useLayoutContext } from "./LayoutContext";
import { useLoaderContext } from "./LoaderContext";
import { LAYOUT_KEY } from "../layouts/keys";
import Label from "../../labels";

export interface IAppContext {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  showSearchMinCharWarning: boolean;
  setShowSearchMinCharWarning: Dispatch<SetStateAction<boolean>>;
  anyEntryExpanded: boolean;
  setAnyEntryExpanded: Dispatch<SetStateAction<boolean>>;
  activeExpandedListLength: number;
  setActiveExpandedListLength: Dispatch<SetStateAction<number>>;
  listItems: ListItem[];
  setListItems: Dispatch<SetStateAction<ListItem[]>>;
  filters: FilterRecord;
  setFilters: Dispatch<SetStateAction<FilterRecord>>;
  detailedEntry: Entry | null;
  setDetailedEntry: Dispatch<SetStateAction<Entry | null>>;
  bulkQueue: Record<string, Entry | null>;
  setBulkQueue: Dispatch<SetStateAction<Record<string, Entry | null>>>;
  handleSearch: () => Promise<void>;
  entries: Entry[];
  cachedNextPageEntries: Entry[];
  currentPage: number;
}

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const useAppContext = () => {
  return useContext(AppContext) as IAppContext;
};

export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { search } = useSearch();
  const { setIsLoading, setLoaderMessage } = useLoaderContext();
  const { setActiveLayout } = useLayoutContext();

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cachedNextPageEntries, setCachedNextPageEntries] = useState<Entry[]>([]);

  const [listItems, setListItems] = useState<ListItem[]>([]);

  const [anyEntryExpanded, setAnyEntryExpanded] = useState(false);
  const [activeExpandedListLength, setActiveExpandedListLength] = useState(0);

  const [showSearchMinCharWarning, setShowSearchMinCharWarning] = useState(false);
  const [filters, setFilters] = useState<FilterRecord>({} as FilterRecord);

  const [detailedEntry, setDetailedEntry] = useState<Entry | null>(null);
  const [bulkQueue, setBulkQueue] = useState<Record<string, Entry | null>>({});

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(Label.GETTING_RESULTS);

    const entries = await search(searchValue, currentPage);
    setEntries(entries);

    const nextPageEntries = await search(searchValue, currentPage + 1);

    setCachedNextPageEntries(nextPageEntries);
    setIsLoading(false);
  }, [currentPage, search, searchValue, setIsLoading, setLoaderMessage]);

  const handleNextPage = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(Label.GETTING_RESULTS);

    if (cachedNextPageEntries.length === 0) {
      setIsLoading(false);
      return;
    }

    setEntries(cachedNextPageEntries);

    const nextPageEntries = await search(searchValue, currentPage + 2);
    setCachedNextPageEntries(nextPageEntries);
    setCurrentPage((prev) => prev + 1);
    setIsLoading(false);
  }, [cachedNextPageEntries, currentPage, search, searchValue, setIsLoading, setLoaderMessage]);

  const handlePrevPage = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(Label.GETTING_RESULTS);

    if (currentPage < 2) {
      setIsLoading(false);
      return;
    }

    setCachedNextPageEntries(entries);

    const prevPageEntries = await search(searchValue, currentPage - 1);
    setEntries(prevPageEntries);
    setCurrentPage((prev) => prev - 1);
    setIsLoading(false);
  }, [entries, searchValue, currentPage, search, setIsLoading, setLoaderMessage]);

  const resetAppState = useCallback(() => {
    setSearchValue("");
    setCurrentPage(1);
    setEntries([]);
    setFilters({} as FilterRecord);
  }, []);

  useEffect(() => {
    setListItems(
      constructListItems({
        entries,
        currentPage,
        nextPageEntries: cachedNextPageEntries,
        handleSearchOption: () => {
          resetAppState();
          setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
        },
        handleNextPageOption: handleNextPage,
        handlePrevPageOption: handlePrevPage,
        handleStartBulkDownloadOption: () => {
          console.log("bulk download");
        },
        handleExitOption: () => {
          console.log("exit");
        },
      })
    );
  }, [
    entries,
    cachedNextPageEntries,
    currentPage,
    handleNextPage,
    handlePrevPage,
    resetAppState,
    setActiveLayout,
  ]);

  return (
    <AppContext.Provider
      value={{
        searchValue,
        setSearchValue,
        showSearchMinCharWarning,
        setShowSearchMinCharWarning,
        anyEntryExpanded,
        setAnyEntryExpanded,
        activeExpandedListLength,
        setActiveExpandedListLength,
        detailedEntry,
        setDetailedEntry,
        listItems,
        setListItems,
        filters,
        setFilters,
        handleSearch,
        entries,
        cachedNextPageEntries,
        currentPage,
        bulkQueue,
        setBulkQueue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
