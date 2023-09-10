import React, { useCallback, useContext } from "react";
import { Entry } from "../../api/models/Entry";
import { useLayoutContext } from "./LayoutContext";
import { LAYOUT_KEY } from "../layouts/keys";
import { useDownloadContext } from "./DownloadContext";
import { useAtom } from "jotai";
import { anyEntryExpandedAtom, detailedEntryAtom } from "../store/app";

export interface IResultListContext {
  handleSeeDetailsOptions: (entry: Entry) => void;
  handleBulkDownloadQueueOption: (entry: Entry) => void;
  handleTurnBackToTheListOption: () => void;
  handleDetailTurnBackToTheList: () => void;
}

export const ResultListContext = React.createContext<IResultListContext | undefined>(undefined);

export const useResultListContext = () => {
  const context = useContext(ResultListContext);
  if (!context) {
    throw new Error("useResultListContext must be used within a ResultListContextProvider");
  }
  return context;
};

export const ResultListContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [, setDetailedEntry] = useAtom(detailedEntryAtom);
  const [, setAnyEntryExpanded] = useAtom(anyEntryExpandedAtom);

  const { bulkDownloadMap, setBulkDownloadMap } = useDownloadContext();
  const { setActiveLayout } = useLayoutContext();

  const handleSeeDetailsOptions = useCallback(
    (entry: Entry) => {
      setDetailedEntry(entry);
      setActiveLayout(LAYOUT_KEY.DETAIL_LAYOUT);
    },
    [setDetailedEntry, setActiveLayout]
  );

  const handleBulkDownloadQueueOption = useCallback(
    (entry: Entry) => {
      if (bulkDownloadMap[entry.id]) {
        setBulkDownloadMap((prev) => ({
          ...prev,
          [entry.id]: null,
        }));
        return;
      }

      setBulkDownloadMap((prev) => ({
        ...prev,
        [entry.id]: entry,
      }));
    },
    [bulkDownloadMap, setBulkDownloadMap]
  );

  const handleTurnBackToTheListOption = useCallback(() => {
    setAnyEntryExpanded(false);
  }, [setAnyEntryExpanded]);

  const handleDetailTurnBackToTheList = useCallback(() => {
    setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
    setDetailedEntry(null);
  }, [setDetailedEntry, setActiveLayout]);

  return (
    <ResultListContext.Provider
      value={{
        handleSeeDetailsOptions,
        handleBulkDownloadQueueOption,
        handleTurnBackToTheListOption,
        handleDetailTurnBackToTheList,
      }}
    >
      {children}
    </ResultListContext.Provider>
  );
};
