import React, { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { Text } from "ink";

export interface IErrorContext {
  throwError: Dispatch<SetStateAction<string | null>>;
  clearError: () => void;
}

export const ErrorContext = React.createContext<IErrorContext | undefined>(undefined);

export const useErrorContext = () => {
  return useContext(ErrorContext) as IErrorContext;
};

const ErrorFallback: React.FC<{ error: string }> = ({ error }) => {
  return (
    <Text>
      Something went wrong:
      <Text> {error}</Text>
    </Text>
  );
};

export const ErrorContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [err, throwError] = useState<string | null>(null);
  const clearError = useCallback(() => throwError(""), []);

  const state = useMemo<IErrorContext>(
    () => ({
      throwError,
      clearError,
    }),
    [clearError]
  );

  return (
    <ErrorContext.Provider value={state}>
      {err !== null && err.length > 0 ? <ErrorFallback error={err} /> : children}
    </ErrorContext.Provider>
  );
};
