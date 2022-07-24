import React, { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { Entry } from "../../api/models/Entry";

import { useSearch } from "../hooks/useSearch";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";

export interface IAppContext {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  showSearchMinCharWarning: boolean;
  setShowSearchMinCharWarning: Dispatch<SetStateAction<boolean>>;
  filters: FilterRecord;
  setFilters: Dispatch<SetStateAction<FilterRecord>>;
  handleSearch: (query: string) => Promise<void>;
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

  const state = useMemo<IAppContext>(
    () => ({
      searchValue,
      setSearchValue,
      showSearchMinCharWarning,
      setShowSearchMinCharWarning,
      filters,
      setFilters,
      handleSearch,
      entries,
    }),
    [searchValue, showSearchMinCharWarning, filters, handleSearch, entries]
  );

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};
