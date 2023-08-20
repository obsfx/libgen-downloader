import React, { useCallback, useContext } from "react";
import { Entry } from "../../api/models/Entry";
import { useAppContext } from "./AppContext";
import { useLayoutContext } from "./LayoutContext";
import { LAYOUT_KEY } from "../layouts/keys";

export interface IResultListContext {
  handleSeeDetailsOptions: (entry: Entry) => void;
  handleBulkDownloadQueueOption: (entry: Entry) => void;
  handleTurnBackToTheListOption: () => void;
  handleDetailTurnBackToTheList: () => void;
}

export const ResultListContext = React.createContext<IResultListContext | undefined>(undefined);

export const useResultListContext = () => {
  return useContext(ResultListContext) as IResultListContext;
};

export const ResultListContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setDetailedEntry, setAnyEntryExpanded, bulkQueue, setBulkQueue } = useAppContext();
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
      if (bulkQueue[entry.id]) {
        setBulkQueue((prev) => ({
          ...prev,
          [entry.id]: null,
        }));
        return;
      }

      setBulkQueue((prev) => ({
        ...prev,
        [entry.id]: entry,
      }));
    },
    [bulkQueue, setBulkQueue]
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
