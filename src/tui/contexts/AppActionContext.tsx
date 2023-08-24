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
import { useLayoutContext } from "./LayoutContext";
import { LAYOUT_KEY } from "../layouts/keys";
import Label from "../../labels";
import { getDocument } from "../../api/data/document";
import { useErrorContext } from "./ErrorContext";
import { useLogContext } from "./LogContext";
import { findDownloadUrlFromMirror } from "../../api/data/url";
import { useAppStateContext } from "./AppStateContext";
import SpinnerText from "../components/SpinnerText";

export interface IAppActionContext {
  handleSearch: () => Promise<void>;
  handleSingleDownload: (entry: Entry) => void;
}

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
  const {
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

    setListItems,

    setFilters,
  } = useAppStateContext();

  const { setActiveLayout } = useLayoutContext();
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

  const handleSingleDownload = useCallback(
    async (entry: Entry) => {
      // TODO: Move this to a separate function
      // Also we need a queue for single downloads

      throwError("Not implemented yet");
      //const mirrorPageDocument = await attempt(
      //  () => getDocument(entry.mirror),
      //  pushLog,
      //  throwError,
      //  clearLog
      //);

      //if (!mirrorPageDocument) {
      //  return;
      //}

      //const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument, throwError);
      //if (!downloadUrl) {
      //  console.log("no download url");
      //  return;
      //}

      //const downloadStream = await attempt(() => fetch(downloadUrl), pushLog, throwError, clearLog);
      //if (!downloadStream) {
      //  console.log("no download stream");
      //  return;
      //}
      //const downloadContentDisposition = downloadStream?.headers.get("content-disposition") || "";
      //const parsedContentDisposition = contentDisposition.parse(downloadContentDisposition);
      //const path = `./${parsedContentDisposition.parameters.filename}`;

      //const file: fs.WriteStream = fs.createWriteStream(path);

      //const total = Number(downloadStream?.headers.get("content-length") || 0);
      //const filename = parsedContentDisposition.parameters.filename;

      //console.log("total", total);

      //downloadStream?.body?.on("data", (chunk) => {
      //  console.log("on data", {
      //    total,
      //    chunk,
      //  });
      //});

      //downloadStream?.body?.on("finish", () => {
      //  console.log("finsih", {
      //    filename,
      //  });
      //});

      //downloadStream?.body?.on("error", () => {
      //  console.log("error", {
      //    filename,
      //  });
      //});

      //downloadStream?.body?.pipe(file);
    },
    [clearLog, pushLog, throwError]
  );

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

  useEffect(() => {
    const constructedListItems = constructListItems({
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
    });

    setListItems(constructedListItems);
  }, [
    entries,
    cachedNextPageEntries,
    currentPage,
    handleNextPage,
    handlePrevPage,
    resetAppState,
    setActiveLayout,
    setListItems,
  ]);

  return (
    <AppActionContext.Provider
      value={{
        handleSearch,
        handleSingleDownload,
      }}
    >
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
