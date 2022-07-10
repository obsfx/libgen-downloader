import React, { Dispatch, SetStateAction, useContext, useMemo, useState } from "react";

import { FilterRecord } from "../layouts/search/search-filter/Filter.data";

export interface IAppContext {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  showSearchMinCharWarning: boolean;
  setShowSearchMinCharWarning: Dispatch<SetStateAction<boolean>>;
  filters: FilterRecord;
  setFilters: Dispatch<SetStateAction<FilterRecord>>;
}

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const useAppContext = () => {
  return useContext(AppContext) as IAppContext;
};

export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");
  const [showSearchMinCharWarning, setShowSearchMinCharWarning] = useState(false);
  const [filters, setFilters] = useState<FilterRecord>({} as FilterRecord);

  const state = useMemo<IAppContext>(
    () => ({
      searchValue,
      setSearchValue,
      showSearchMinCharWarning,
      setShowSearchMinCharWarning,
      filters,
      setFilters,
    }),
    [searchValue, showSearchMinCharWarning, filters]
  );

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};
