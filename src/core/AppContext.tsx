import React, { useState } from 'react';

export interface IAppContext {
  searchValue: string;
  setSearchValue: (value: string) => void;

  showSearchMinCharWarning: boolean;
  setShowSearchMinCharWarning: (value: boolean) => void;
}

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showSearchMinCharWarning, setShowSearchMinCharWarning] = useState(false);

  return (
    <AppContext.Provider
      value={{
        searchValue,
        setSearchValue,
        showSearchMinCharWarning,
        setShowSearchMinCharWarning,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
