import { useAtom } from "jotai";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";
import { StandardDownloadManager } from "../classes/StandardDownloadManager";
import { useConfigContext } from "../contexts/ConfigContext";
import { useLogContext } from "../contexts/LogContext";
import {
  currentDownloadProgressAtom,
  downloadQueueMapAtom,
  downloadQueueStatusAtom,
  totalAddedToDownloadQueueAtom,
  totalDownloadedAtom,
  totalFailedAtom,
} from "../store/download";

export const useDownloadManager = () => {
  const { pushLog, clearLog } = useLogContext();
  const { config, mirror } = useConfigContext();

  const [, setDownloadQueueStatus] = useAtom(downloadQueueStatusAtom);
  const [, setTotalAddedToDownloadQueue] = useAtom(totalAddedToDownloadQueueAtom);
  const [, setCurrentDownloadProgress] = useAtom(currentDownloadProgressAtom);
  const [, setTotalDownloaded] = useAtom(totalDownloadedAtom);
  const [, setTotalFailed] = useAtom(totalFailedAtom);
  const [, setDownloadQueueMap] = useAtom(downloadQueueMapAtom);

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

  //BulkDownloadManager.registerAppConfig(config);
  //BulkDownloadManager.registerEvents({
  //  subscribeToBulkDownloadProgress: (bulkMap: Record<string, BulkDownloadState>) => {
  //    console.log("subscribeToBulkDownloadMap", bulkMap);
  //  },
  //});
};
