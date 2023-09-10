import React, { useCallback, useContext, useState } from "react";
import { Box, Text } from "ink";
import { useLogContext } from "./LogContext";
import OptionList from "../components/OptionList";
import { useAtom } from "jotai";
import { isLoadingAtom } from "../store/app";

export type ThrowError = (err: string | null) => void;

export interface IErrorContext {
  errorThrown: boolean;
  throwError: ThrowError;
  clearError: () => void;
}

export const ErrorContext = React.createContext<IErrorContext | undefined>(undefined);

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorContext must be used within a ErrorContextProvider");
  }
  return context;
};

const ErrorFallback: React.FC<{ error: string; onClearError: () => void }> = ({
  error,
  onClearError,
}) => {
  return (
    <Box>
      <Box>
        <Text>
          Something went wrong:
          <Text> {error}</Text>
        </Text>
      </Box>

      <OptionList
        options={{
          ["Clear Error"]: {
            label: "Clear Error",
            onSelect: onClearError,
          },
        }}
      />
    </Box>
  );
};

export const ErrorContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { clearLog } = useLogContext();
  const [, setIsLoading] = useAtom(isLoadingAtom);

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
  const errorThrown = err !== null && err.length > 0;

  return (
    <ErrorContext.Provider
      value={{
        errorThrown,
        throwError,
        clearError,
      }}
    >
      {errorThrown && <ErrorFallback error={err} onClearError={clearError} />}
      {children}
    </ErrorContext.Provider>
  );
};
