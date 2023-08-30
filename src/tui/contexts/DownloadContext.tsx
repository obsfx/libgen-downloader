import React, { Dispatch, SetStateAction, useState } from "react";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";
import { useLogContext } from "./LogContext";
import { StandardDownloadManager } from "../classes/StandardDownloadManager";

export interface IDownloadContext {
  downloadQueueMap: Record<string, Entry>;
  downloadQueueStatus: DownloadStatus;
  totalAddedToDownloadQueue: number;
  totalDownloaded: number;
  totalFailed: number;
  bulkDownloadMap: Record<string, Entry | null>;
  setBulkDownloadMap: Dispatch<SetStateAction<Record<string, Entry | null>>>;
  currentDownloadProgress: {
    filename: string;
    progress: number;
    total: number;
  };
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

  const [downloadQueueMap, setDownloadQueueMap] = useState<Record<string, Entry>>({});
  const [downloadQueueStatus, setDownloadQueueStatus] = useState(DownloadStatus.IDLE);
  const [totalAddedToDownloadQueue, setTotalAddedToDownloadQueue] = useState(0);
  const [totalDownloaded, setTotalDownloaded] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [currentDownloadProgress, setCurrentDownloadProgress] = useState({
    filename: "",
    progress: 0,
    total: 0,
  });

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
      setCurrentDownloadProgress({
        filename,
        progress: chunkSize,
        total,
      });
    },
    onDownloadUpdate: (filename: string, chunkSize: number, total: number) => {
      setCurrentDownloadProgress((prev) => ({
        filename,
        progress: prev.progress + chunkSize,
        total,
      }));
    },
    onDownloadComplete: () => {
      setTotalDownloaded((prev) => prev + 1);
    },
    onDownloadFail: () => {
      setTotalFailed((prev) => prev + 1);
    },
    subscribeToDownloadQueueMap: (map: Record<string, Entry>) => {
      setDownloadQueueMap(map);
    },
  });

  return (
    <DownloadContext.Provider
      value={{
        downloadQueueMap,
        downloadQueueStatus,
        totalAddedToDownloadQueue,
        totalDownloaded,
        totalFailed,
        bulkDownloadMap,
        setBulkDownloadMap,
        currentDownloadProgress,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};
