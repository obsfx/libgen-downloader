import React, { Dispatch, SetStateAction, useState } from "react";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";
import { useLogContext } from "./LogContext";
import { StandardDownloadManager } from "../classes/StandardDownloadManager";

export interface IDownloadContext {
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
  const { pushLog, clearLog } = useLogContext();

  const [downloadQueueStatus, setDownloadQueueStatus] = useState(DownloadStatus.IDLE);
  const [totalAddedToDownloadQueue, setTotalAddedToDownloadQueue] = useState(0);
  const [totalDownloaded, setTotalDownloaded] = useState(0);

  const [bulkDownloadMap, setBulkDownloadMap] = useState<Record<string, Entry | null>>({});

  StandardDownloadManager.registerEvents({
    onFail: (message: string) => {
      pushLog(message);
    },
    onStatusChange: (status: DownloadStatus) => {
      setDownloadQueueStatus(status);
    },
    onStageComplete: () => clearLog(),
    onAddedToQueue: (entry: Entry) => {
      setTotalAddedToDownloadQueue((prev) => prev + 1);
    },
    onDownloadStart: (filename: string, chunkSize: number, total: number) => {
      console.log("start", filename, chunkSize, total);
    },
    onDownloadUpdate: (filename: string, chunkSize: number, total: number) => {
      console.log("update", filename, chunkSize, total);
    },
    onDownloadComplete: () => {
      setTotalDownloaded((prev) => prev + 1);
    },
  });

  return (
    <DownloadContext.Provider
      value={{
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
