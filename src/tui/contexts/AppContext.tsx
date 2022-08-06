import React, { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";

import { useSearch } from "../hooks/useSearch";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";

export interface IAppContext {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  showSearchMinCharWarning: boolean;
  setShowSearchMinCharWarning: Dispatch<SetStateAction<boolean>>;
  listItems: ListItem[];
  setListItems: Dispatch<SetStateAction<ListItem[]>>;
  filters: FilterRecord;
  setFilters: Dispatch<SetStateAction<FilterRecord>>;
  handleSearch: (query: string) => Promise<void>;
  resetAppState: () => void;
  entries: Entry[];
}

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const useAppContext = () => {
  return useContext(AppContext) as IAppContext;
};

export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { search } = useSearch();

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);

  const [showSearchMinCharWarning, setShowSearchMinCharWarning] = useState(false);
  const [filters, setFilters] = useState<FilterRecord>({} as FilterRecord);

  const handleSearch = useCallback(
    async (query: string) => {
      const entries = await search(query, currentPage);
      if (entries) {
        setEntries(entries);
      }
    },
    [search, currentPage]
  );

  const resetAppState = useCallback(() => {
    setSearchValue("");
    setCurrentPage(1);
    setEntries([]);
    setListItems([]);
    setFilters({} as FilterRecord);
  }, []);

  const state = useMemo<IAppContext>(
    () => ({
      searchValue,
      setSearchValue,
      showSearchMinCharWarning,
      setShowSearchMinCharWarning,
      listItems,
      setListItems,
      filters,
      setFilters,
      handleSearch,
      resetAppState,
      entries,
    }),
    [
      searchValue,
      showSearchMinCharWarning,
      listItems,
      setListItems,
      filters,
      handleSearch,
      resetAppState,
      entries,
    ]
  );

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};
