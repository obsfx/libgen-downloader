import React, { Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { GETTING_RESULTS } from "../../constants";
import { useSearch } from "../hooks/useSearch";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";
import { useLoaderContext } from "./LoaderContext";

export interface IAppContext {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  showSearchMinCharWarning: boolean;
  setShowSearchMinCharWarning: Dispatch<SetStateAction<boolean>>;
  listItems: ListItem[];
  setListItems: Dispatch<SetStateAction<ListItem[]>>;
  filters: FilterRecord;
  setFilters: Dispatch<SetStateAction<FilterRecord>>;
  handleSearch: () => Promise<void>;
  handleNextPage: () => Promise<void>;
  handlePrevPage: () => Promise<void>;
  resetAppState: () => void;
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

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cachedNextPageEntries, setCachedNextPageEntries] = useState<Entry[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);

  const [showSearchMinCharWarning, setShowSearchMinCharWarning] = useState(false);
  const [filters, setFilters] = useState<FilterRecord>({} as FilterRecord);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(GETTING_RESULTS);

    const entries = await search(searchValue, currentPage);
    setEntries(entries);

    const nextPageEntries = await search(searchValue, currentPage + 1);
    setCachedNextPageEntries(nextPageEntries);
    setIsLoading(false);
  }, [search, searchValue, currentPage, setIsLoading, setLoaderMessage]);

  const handleNextPage = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(GETTING_RESULTS);

    if (cachedNextPageEntries.length === 0) {
      return;
    }

    setEntries(cachedNextPageEntries);

    const nextPageEntries = await search(searchValue, currentPage + 2);
    setCachedNextPageEntries(nextPageEntries);
    setCurrentPage((prev) => prev + 1);
    setIsLoading(false);
  }, [searchValue, currentPage, cachedNextPageEntries, search, setIsLoading, setLoaderMessage]);

  const handlePrevPage = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(GETTING_RESULTS);

    if (currentPage < 2) {
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
    setListItems([]);
    setFilters({} as FilterRecord);
  }, []);

  return (
    <AppContext.Provider
      value={{
        searchValue,
        setSearchValue,
        showSearchMinCharWarning,
        setShowSearchMinCharWarning,
        listItems,
        setListItems,
        filters,
        setFilters,
        handleSearch,
        handleNextPage,
        handlePrevPage,
        resetAppState,
        entries,
        cachedNextPageEntries,
        currentPage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
