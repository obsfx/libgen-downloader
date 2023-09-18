import React, { useCallback, useContext } from "react";
import { Entry } from "../../api/models/Entry";
import { LAYOUT_KEY } from "../layouts/keys";
import { useBoundStore } from "../store";

export interface IResultListContext {
  handleSeeDetailsOptions: (entry: Entry) => void;
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
    setDetailedEntry(null);
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
};
