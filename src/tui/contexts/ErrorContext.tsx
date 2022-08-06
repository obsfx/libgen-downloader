import React, { useCallback, useContext, useMemo, useState } from "react";
import { Text } from "ink";
import { useLoaderContext } from "./LoaderContext";
import { useLogContext } from "./LogContext";

export type ThrowError = (err: string | null) => void;

export interface IErrorContext {
  throwError: ThrowError;
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
  const { clearLog } = useLogContext();
  const { setIsLoading } = useLoaderContext();

  const [err, setErr] = useState<string | null>(null);

  const throwError = useCallback(
    (err: string | null) => {
      setIsLoading(false);
      setErr(err);
      clearLog();
    },
    [setIsLoading, clearLog]
  );

  const clearError = useCallback(() => throwError(""), [throwError]);

  const state = useMemo<IErrorContext>(
    () => ({
      throwError,
      clearError,
    }),
    [clearError, throwError]
  );

  return (
    <ErrorContext.Provider value={state}>
      {err !== null && err.length > 0 ? <ErrorFallback error={err} /> : children}
    </ErrorContext.Provider>
  );
};
