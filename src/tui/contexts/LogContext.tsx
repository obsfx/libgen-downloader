import React, { useCallback, useContext, useMemo, useState } from "react";
import { Box, Text } from "ink";

export interface ILogContext {
  pushLog: (message: string) => void;
  clearLog: () => void;
}

export const LogContext = React.createContext<ILogContext | undefined>(undefined);

export const useLogContext = () => {
  return useContext(LogContext) as ILogContext;
};

export const LogContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);

  const pushLog = useCallback((message: string) => {
    setLogs((prev) => [...prev, message]);
  }, []);

  const clearLog = useCallback(() => {
    setLogs([]);
  }, []);

  const state = useMemo<ILogContext>(
    () => ({
      pushLog,
      clearLog,
    }),
    [pushLog, clearLog]
  );

  return (
    <LogContext.Provider value={state}>
      {children}
      <Box flexDirection="column">
        {logs.map((log, idx) => (
          <Text key={idx}>{log}</Text>
        ))}
      </Box>
    </LogContext.Provider>
  );
};
