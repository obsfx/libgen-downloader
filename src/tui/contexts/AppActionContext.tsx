import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Box, Text } from "ink";
import fs from "fs";
import contentDisposition from "content-disposition";
import fetch from "node-fetch";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { attempt, constructListItems } from "../../utils";
import { useSearch } from "../hooks/useSearch";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";
import { LAYOUT_KEY } from "../layouts/keys";
import Label from "../../labels";
import { getDocument } from "../../api/data/document";
import { useErrorContext } from "./ErrorContext";
import { useLogContext } from "./LogContext";
import { findDownloadUrlFromMirror } from "../../api/data/url";
import SpinnerText from "../components/SpinnerText";
import { useDownloadContext } from "./DownloadContext";
import { useAtom } from "jotai";
import {
  cachedNextPageEntriesAtom,
  currentPageAtom,
  entriesAtom,
  filtersAtom,
  isLoadingAtom,
  listItemsAtom,
  loaderMessageAtom,
  searchValueAtom,
} from "../store/app";

export interface IAppActionContext {}

export const AppActionContext = React.createContext<IAppActionContext | null>(null);

export const useAppActionContext = () => {
  const context = useContext(AppActionContext);
  if (!context) {
    throw new Error("useAppActionContext must be used within a AppActionContextProvider");
  }
  return context;
};

export const AppActionContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [loaderMessage, setLoaderMessage] = useAtom(loaderMessageAtom);
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const [entries, setEntries] = useAtom(entriesAtom);
  const [cachedNextPageEntries, setCachedNextPageEntries] = useAtom(cachedNextPageEntriesAtom);
  const [, setListItems] = useAtom(listItemsAtom);
  const [, setFilters] = useAtom(filtersAtom);

  const { startBulkDownload } = useDownloadContext();

  const { errorThrown, throwError } = useErrorContext();
  const { pushLog, clearLog } = useLogContext();

  const { search } = useSearch();

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(Label.GETTING_RESULTS);

    const entries = await search(searchValue, currentPage);
    setEntries(entries);

    const nextPageEntries = await search(searchValue, currentPage + 1);

    setCachedNextPageEntries(nextPageEntries);
    setIsLoading(false);
  }, [
    currentPage,
    search,
    searchValue,
    setIsLoading,
    setLoaderMessage,
    setCachedNextPageEntries,
    setEntries,
  ]);

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
  }, [
    cachedNextPageEntries,
    currentPage,
    search,
    searchValue,
    setIsLoading,
    setLoaderMessage,
    setEntries,
    setCurrentPage,
    setCachedNextPageEntries,
  ]);

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
  }, [
    entries,
    searchValue,
    currentPage,
    search,
    setIsLoading,
    setLoaderMessage,
    setCachedNextPageEntries,
    setEntries,
    setCurrentPage,
  ]);

  const resetAppState = useCallback(() => {
    setSearchValue("");
    setCurrentPage(1);
    setEntries([]);
    setFilters({} as FilterRecord);
  }, [setSearchValue, setCurrentPage, setEntries, setFilters]);

  //useEffect(() => {
  //  const constructedListItems = constructListItems({
  //    entries,
  //    currentPage,
  //    nextPageEntries: cachedNextPageEntries,
  //    handleSearchOption: () => {
  //      resetAppState();
  //      setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
  //    },
  //    handleNextPageOption: handleNextPage,
  //    handlePrevPageOption: handlePrevPage,
  //    handleStartBulkDownloadOption: startBulkDownload,
  //    handleExitOption: () => {
  //      console.log("exit");
  //    },
  //  });

  //  setListItems(constructedListItems);
  //}, [
  //  entries,
  //  cachedNextPageEntries,
  //  currentPage,
  //  handleNextPage,
  //  handlePrevPage,
  //  resetAppState,
  //  setActiveLayout,
  //  setListItems,
  //  startBulkDownload,
  //]);

  return (
    <AppActionContext.Provider value={{}}>
      {isLoading && (
        <SpinnerText>
          <Text>{loaderMessage}</Text>
        </SpinnerText>
      )}
      <Box width="100%" display={isLoading ? "none" : "flex"}>
        {!errorThrown && children}
      </Box>
    </AppActionContext.Provider>
  );
};
