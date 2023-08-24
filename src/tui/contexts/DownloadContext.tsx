import React, { Dispatch, SetStateAction, useState } from "react";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";

export interface IDownloadContext {
  downloadQueue: Entry[];
  setDownloadQueue: Dispatch<SetStateAction<Entry[]>>;
  downloadQueueStatus: DownloadStatus;
  setDownloadQueueStatus: Dispatch<SetStateAction<DownloadStatus>>;
  totalAddedToDownloadQueue: number;
  setTotalAddedToDownloadQueue: Dispatch<SetStateAction<number>>;
  totalDownloaded: number;
  setTotalDownloaded: Dispatch<SetStateAction<number>>;
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
  const [downloadQueueStatus, setDownloadQueueStatus] = useState(DownloadStatus.IN_QUEUE);
  const [totalAddedToDownloadQueue, setTotalAddedToDownloadQueue] = useState(0);
  const [totalDownloaded, setTotalDownloaded] = useState(0);

  const [bulkDownloadMap, setBulkDownloadMap] = useState<Record<string, Entry | null>>({});

  return (
    <DownloadContext.Provider
      value={{
        downloadQueue,
        setDownloadQueue,
        downloadQueueStatus,
        setDownloadQueueStatus,
        totalAddedToDownloadQueue,
        setTotalAddedToDownloadQueue,
        totalDownloaded,
        setTotalDownloaded,
        bulkDownloadMap,
        setBulkDownloadMap,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};
