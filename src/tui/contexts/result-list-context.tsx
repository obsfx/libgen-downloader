import React, { useCallback, useContext } from "react";
import { Entry } from "../../api/models/entry";
import { LAYOUT_KEY } from "../layouts/keys";
import { useBoundStore } from "../store";
import { MissingContextProviderError } from "../../errors";

interface IResultListContext {
  handleSeeDetailsOptions: (entry: Entry) => void;
  handleTurnBackToTheListOption: () => void;
  handleDetailTurnBackToTheList: () => void;
}

export interface ResultListContextProviderProperties {
  children: React.ReactNode;
}

const ResultListContext = React.createContext<IResultListContext | undefined>(undefined);

export const useResultListContext = () => {
  const context = useContext(ResultListContext);
  if (!context) {
    throw new MissingContextProviderError("useResultListContext", "ResultListContextProvider");
  }
  return context;
};

export function ResultListContextProvider({ children }: ResultListContextProviderProperties) {
  const setDetailedEntry = useBoundStore((state) => state.setDetailedEntry);
  const setAnyEntryExpanded = useBoundStore((state) => state.setAnyEntryExpanded);
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);

  const handleSeeDetailsOptions = useCallback(
    (entry: Entry) => {
      setDetailedEntry(entry);
      setActiveLayout(LAYOUT_KEY.DETAIL_LAYOUT);
    },
    [setDetailedEntry, setActiveLayout]
  );

  const handleTurnBackToTheListOption = useCallback(() => {
    setAnyEntryExpanded(false);
  }, [setAnyEntryExpanded]);

  const handleDetailTurnBackToTheList = useCallback(() => {
    setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
    setDetailedEntry(undefined);
  }, [setDetailedEntry, setActiveLayout]);

  return (
    <ResultListContext.Provider
      value={{
        handleSeeDetailsOptions,
        handleTurnBackToTheListOption,
        handleDetailTurnBackToTheList,
      }}
    >
      {children}
    </ResultListContext.Provider>
  );
}
