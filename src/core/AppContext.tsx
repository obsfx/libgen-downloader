import React, { useState } from 'react';

export interface IAppContext {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <AppContext.Provider
      value={{
        searchValue,
        setSearchValue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
