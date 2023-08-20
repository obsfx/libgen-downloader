import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import fs from "fs";
import contentDisposition from "content-disposition";
import fetch from "node-fetch";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { attempt, constructListItems } from "../../utils";
import { useSearch } from "../hooks/useSearch";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";
import { useLayoutContext } from "./LayoutContext";
import { useLoaderContext } from "./LoaderContext";
import { LAYOUT_KEY } from "../layouts/keys";
import Label from "../../labels";
import { getDocument } from "../../api/data/document";
import { useErrorContext } from "./ErrorContext";
import { useLogContext } from "./LogContext";
import { findDownloadUrlFromMirror } from "../../api/data/url";

export interface IAppContext {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
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
  bulkQueue: Record<string, Entry | null>;
  setBulkQueue: Dispatch<SetStateAction<Record<string, Entry | null>>>;
  entries: Entry[];
  cachedNextPageEntries: Entry[];
  currentPage: number;

  handleSearch: () => Promise<void>;
  handleSingleDownload: (entry: Entry) => void;
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
  const { setActiveLayout } = useLayoutContext();
  const { throwError } = useErrorContext();
  const { pushLog, clearLog } = useLogContext();

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
  const [bulkQueue, setBulkQueue] = useState<Record<string, Entry | null>>({});

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage(Label.GETTING_RESULTS);

    const entries = await search(searchValue, currentPage);
    setEntries(entries);

    const nextPageEntries = await search(searchValue, currentPage + 1);

    setCachedNextPageEntries(nextPageEntries);
    setIsLoading(false);
  }, [currentPage, search, searchValue, setIsLoading, setLoaderMessage]);

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
  }, [cachedNextPageEntries, currentPage, search, searchValue, setIsLoading, setLoaderMessage]);

  const handleSingleDownload = useCallback(
    async (entry: Entry) => {
      // TODO: Move this to a separate function
      const mirrorPageDocument = await attempt(
        () => getDocument(entry.mirror),
        pushLog,
        throwError,
        clearLog
      );

      if (!mirrorPageDocument) {
        return;
      }

      const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument, throwError);
      if (!downloadUrl) {
        console.log("no download url");
        return;
      }

      const downloadStream = await attempt(() => fetch(downloadUrl), pushLog, throwError, clearLog);
      if (!downloadStream) {
        console.log("no download stream");
        return;
      }
      const downloadContentDisposition = downloadStream?.headers.get("content-disposition") || "";
      const parsedContentDisposition = contentDisposition.parse(downloadContentDisposition);
      const path = `./${parsedContentDisposition.parameters.filename}`;

      const file: fs.WriteStream = fs.createWriteStream(path);

      const total = Number(downloadStream?.headers.get("content-length") || 0);
      const filename = parsedContentDisposition.parameters.filename;

      console.log("total", total);

      downloadStream?.body?.on("data", (chunk) => {
        console.log("on data", {
          total,
          chunk,
        });
      });

      downloadStream?.body?.on("finish", () => {
        console.log("finsih", {
          filename,
        });
      });

      downloadStream?.body?.on("error", () => {
        console.log("error", {
          filename,
        });
      });

      downloadStream?.body?.pipe(file);
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
  }, [entries, searchValue, currentPage, search, setIsLoading, setLoaderMessage]);

  const resetAppState = useCallback(() => {
    setSearchValue("");
    setCurrentPage(1);
    setEntries([]);
    setFilters({} as FilterRecord);
  }, []);

  useEffect(() => {
    setListItems(
      constructListItems({
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
      })
    );
  }, [
    entries,
    cachedNextPageEntries,
    currentPage,
    handleNextPage,
    handlePrevPage,
    resetAppState,
    setActiveLayout,
  ]);

  return (
    <AppContext.Provider
      value={{
        searchValue,
        setSearchValue,
        showSearchMinCharWarning,
        setShowSearchMinCharWarning,
        anyEntryExpanded,
        setAnyEntryExpanded,
        activeExpandedListLength,
        setActiveExpandedListLength,
        detailedEntry,
        setDetailedEntry,
        listItems,
        setListItems,
        filters,
        setFilters,
        entries,
        cachedNextPageEntries,
        currentPage,
        bulkQueue,
        setBulkQueue,

        handleSearch,
        handleSingleDownload,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
