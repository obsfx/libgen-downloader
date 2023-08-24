import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";

export interface IAppStateContext {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  loaderMessage: string;
  setLoaderMessage: Dispatch<SetStateAction<string>>;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  entries: Entry[];
  setEntries: Dispatch<SetStateAction<Entry[]>>;
  cachedNextPageEntries: Entry[];
  setCachedNextPageEntries: Dispatch<SetStateAction<Entry[]>>;
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
}

export const AppStateContext = React.createContext<IAppStateContext | null>(null);

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppStateContext must be used within a AppStateContextProvider");
  }
  return context;
};

export const AppStateContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");

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

  return (
    <AppStateContext.Provider
      value={{
        isLoading,
        setIsLoading,

        loaderMessage,
        setLoaderMessage,

        searchValue,
        setSearchValue,

        currentPage,
        setCurrentPage,

        entries,
        setEntries,

        cachedNextPageEntries,
        setCachedNextPageEntries,

        listItems,
        setListItems,

        anyEntryExpanded,
        setAnyEntryExpanded,

        activeExpandedListLength,
        setActiveExpandedListLength,

        showSearchMinCharWarning,
        setShowSearchMinCharWarning,

        filters,
        setFilters,

        detailedEntry,
        setDetailedEntry,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
