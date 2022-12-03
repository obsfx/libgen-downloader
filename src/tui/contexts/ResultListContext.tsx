import React, { useCallback, useContext } from "react";
import { Entry } from "../../api/models/Entry";
import { useAppContext } from "./AppContext";
import { useLayoutContext } from "./LayoutContext";
import { DETAIL_LAYOUT, RESULT_LIST_LAYOUT } from "../../constants";

export interface IResultListContext {
  handleSeeDetailsOptions: (entry: Entry) => void;
  handleDownloadDirectlyOption: () => void;
  handleAddToBulkDownloadQueueOption: () => void;
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
  const { setDetailedEntry, setAnyEntryExpanded } = useAppContext();
  const { setActiveLayout } = useLayoutContext();

  const handleSeeDetailsOptions = useCallback(
    (entry: Entry) => {
      setDetailedEntry(entry);
      setActiveLayout(DETAIL_LAYOUT);
    },
    [setDetailedEntry, setActiveLayout]
  );

  const handleDownloadDirectlyOption = useCallback(() => {
    return undefined;
  }, []);

  const handleAddToBulkDownloadQueueOption = useCallback(() => {
    return undefined;
  }, []);

  const handleTurnBackToTheListOption = useCallback(() => {
    setAnyEntryExpanded(false);
  }, [setAnyEntryExpanded]);

  const handleDetailTurnBackToTheList = useCallback(() => {
    setActiveLayout(RESULT_LIST_LAYOUT);
    setDetailedEntry(null);
  }, [setDetailedEntry, setActiveLayout]);

  return (
    <ResultListContext.Provider
      value={{
        handleSeeDetailsOptions,
        handleDownloadDirectlyOption,
        handleAddToBulkDownloadQueueOption,
        handleTurnBackToTheListOption,
        handleDetailTurnBackToTheList,
      }}
    >
      {children}
    </ResultListContext.Provider>
  );
};
