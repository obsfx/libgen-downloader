import React, { useState } from 'react';

import { FilterRecord } from '../core/layouts/search/search-filter/Filter.data';

export interface IAppContext {
  searchValue: string;
  setSearchValue: (value: string) => void;
  showSearchMinCharWarning: boolean;
  setShowSearchMinCharWarning: (value: boolean) => void;
  filters: FilterRecord;
  setFilters: (v: FilterRecord) => void;
}

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showSearchMinCharWarning, setShowSearchMinCharWarning] = useState(false);

  const [filters, setFilters] = useState<FilterRecord>({} as FilterRecord);

  return (
    <AppContext.Provider
      value={{
        searchValue,
        setSearchValue,
        showSearchMinCharWarning,
        setShowSearchMinCharWarning,
        filters,
        setFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
