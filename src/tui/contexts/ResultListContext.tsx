import React, { useState, useContext, Dispatch, SetStateAction } from "react";

export interface IResultListContext {
  handleSeeDetailsOptions: () => void;
  handleDownloadDirectlyOption: () => void;
  handleAddToBulkDownloadQueueOption: () => void;
  handleTurnBackToTheListOption: () => void;
  anyEntryExpanded: boolean;
  setAnyEntryExpanded: Dispatch<SetStateAction<boolean>>;
}

export const ResultListContext = React.createContext<IResultListContext | undefined>(undefined);

export const useResultListContext = () => {
  return useContext(ResultListContext) as IResultListContext;
};

export const ResultListContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [anyEntryExpanded, setAnyEntryExpanded] = useState(false);

  const handleSeeDetailsOptions = () => {
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
      }}
    >
      {children}
    </ResultListContext.Provider>
  );
};
