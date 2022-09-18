import React, { useState, useContext, Dispatch, SetStateAction } from "react";
import { Entry } from "../../api/models/Entry";

export interface IResultListContext {
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
  const [anyEntryExpanded, setAnyEntryExpanded] = useState(false);
  const [activeExpandedListLength, setActiveExpandedListLength] = useState(0);

  const handleSeeDetailsOptions = (entry: Entry) => {
    return undefined;
  };

  const handleDownloadDirectlyOption = () => {
    return undefined;
  };

  const handleAddToBulkDownloadQueueOption = () => {
    return undefined;
  };

  const handleTurnBackToTheListOption = () => {
    setAnyEntryExpanded(false);
  };

  return (
    <ResultListContext.Provider
      value={{
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
