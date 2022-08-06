import React, { useContext, useMemo } from "react";

export interface IResultListContext {
  test?: string;
}

export const ResultListContext = React.createContext<IResultListContext | undefined>(undefined);

export const useResultListContext = () => {
  return useContext(ResultListContext) as IResultListContext;
};

export const ResultListContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const state = useMemo<IResultListContext>(() => {
    return {};
  }, []);

  return <ResultListContext.Provider value={state}>{children}</ResultListContext.Provider>;
};
