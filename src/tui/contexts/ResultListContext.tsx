import React, { useCallback, useState, useContext, Dispatch, SetStateAction } from "react";
import { Entry } from "../../api/models/Entry";
import { useAppContext } from "./AppContext";
import { useLayoutContext } from "./LayoutContext";
import { SEARCH_LAYOUT } from "../../constants";

export interface IResultListContext {
  handleSearchOption: () => void;
  handleNextPageOption: () => void;
  handlePrevPageOption: () => void;
  handleStartBulkDownloadOption: () => void;
  handleExitOption: () => void;
  handleSeeDetailsOptions: (entry: Entry) => void;
  handleDownloadDirectlyOption: () => void;
  handleAddToBulkDownloadQueueOption: () => void;
  handleTurnBackToTheListOption: () => void;
  anyEntryExpanded: boolean;
  setAnyEntryExpanded: Dispatch<SetStateAction<boolean>>;
  activeExpandedListLength: number;
  setActiveExpandedListLength: Dispatch<SetStateAction<number>>;
}

export const ResultListContext = React.createContext<IResultListContext | undefined>(undefined);

export const useResultListContext = () => {
  return useContext(ResultListContext) as IResultListContext;
};

export const ResultListContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { resetAppState, handleNextPage, handlePrevPage } = useAppContext();
  const { setActiveLayout } = useLayoutContext();

  const [anyEntryExpanded, setAnyEntryExpanded] = useState(false);
  const [activeExpandedListLength, setActiveExpandedListLength] = useState(0);

  const handleSearchOption = useCallback(() => {
    resetAppState();
    setActiveLayout(SEARCH_LAYOUT);
  }, [resetAppState, setActiveLayout]);

  const handleNextPageOption = useCallback(() => {
    handleNextPage();
  }, [handleNextPage]);

  const handlePrevPageOption = useCallback(() => {
    handlePrevPage();
  }, [handlePrevPage]);

  const handleStartBulkDownloadOption = useCallback(() => {
    return undefined;
  }, []);

  const handleExitOption = useCallback(() => {
    return undefined;
  }, []);

  const handleSeeDetailsOptions = useCallback((entry: Entry) => {
    return undefined;
  }, []);

  const handleDownloadDirectlyOption = useCallback(() => {
    return undefined;
  }, []);

  const handleAddToBulkDownloadQueueOption = useCallback(() => {
    return undefined;
  }, []);

  const handleTurnBackToTheListOption = useCallback(() => {
    setAnyEntryExpanded(false);
  }, []);

  return (
    <ResultListContext.Provider
      value={{
        handleSearchOption,
        handleNextPageOption,
        handlePrevPageOption,
        handleStartBulkDownloadOption,
        handleExitOption,
        handleSeeDetailsOptions,
        handleDownloadDirectlyOption,
        handleAddToBulkDownloadQueueOption,
        handleTurnBackToTheListOption,
        anyEntryExpanded,
        setAnyEntryExpanded,
        activeExpandedListLength,
        setActiveExpandedListLength,
      }}
    >
      {children}
    </ResultListContext.Provider>
  );
};
