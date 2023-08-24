import React, { Dispatch, SetStateAction, useState } from "react";
import { Entry } from "../../api/models/Entry";

export interface IDownloadContext {
  downloadQueue: Entry[];
  setDownloadQueue: Dispatch<SetStateAction<Entry[]>>;
  bulkDownloadMap: Record<string, Entry | null>;
  setBulkDownloadMap: Dispatch<SetStateAction<Record<string, Entry | null>>>;
}

export const DownloadContext = React.createContext<IDownloadContext | null>(null);

export const useDownloadContext = () => {
  const context = React.useContext(DownloadContext);
  if (!context) {
    throw new Error("useDownloadContext must be used within a DownloadContextProvider");
  }
  return context;
};

export const DownloadContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [downloadQueue, setDownloadQueue] = useState<Entry[]>([]);
  const [bulkDownloadMap, setBulkDownloadMap] = useState<Record<string, Entry | null>>({});

  return (
    <DownloadContext.Provider
      value={{
        downloadQueue,
        setDownloadQueue,
        bulkDownloadMap,
        setBulkDownloadMap,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};
