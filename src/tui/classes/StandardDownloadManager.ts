import fetch from "node-fetch";
import { getDocument } from "../../api/data/document";
import { downloadFile } from "../../api/data/download";
import { findDownloadUrlFromMirror } from "../../api/data/url";
import { DownloadResult } from "../../api/models/DownloadResult";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";
import { attempt } from "../../utils";

export abstract class StandardDownloadManager {
  private static onFail: (message: string) => void;
  private static onStatusChange: (status: DownloadStatus) => void;
  private static onStageComplete: () => void;
  private static onAddedToQueue: (entry: Entry) => void;
  private static onDownloadStart: (filename: string, chunkSize: number, total: number) => void;
  private static onDownloadUpdate: (filename: string, chunkSize: number, total: number) => void;
  private static onDownloadComplete: (downloadResult: DownloadResult) => void;

  private static queueMap: Record<string, Entry> = {};
  private static queueStatus: DownloadStatus = DownloadStatus.IDLE;

  static registerEvents({
    onFail,
    onStatusChange,
    onStageComplete,
    onAddedToQueue,
    onDownloadStart,
    onDownloadUpdate,
    onDownloadComplete,
  }: {
    onFail: (message: string) => void;
    onStatusChange: (status: DownloadStatus) => void;
    onStageComplete: () => void;
    onAddedToQueue: (entry: Entry) => void;
    onDownloadStart: (filename: string, chunkSize: number, total: number) => void;
    onDownloadUpdate: (filename: string, chunkSize: number, total: number) => void;
    onDownloadComplete: (downloadResult: DownloadResult) => void;
  }) {
    this.onFail = onFail;
    this.onStatusChange = onStatusChange;
    this.onStageComplete = onStageComplete;
    this.onAddedToQueue = onAddedToQueue;
    this.onDownloadStart = onDownloadStart;
    this.onDownloadUpdate = onDownloadUpdate;
    this.onDownloadComplete = onDownloadComplete;
  }

  public static pushToDownloadQueueMap(entry: Entry): void {
    if (this.queueMap[entry.id]) {
      return;
    }

    this.queueMap[entry.id] = entry;
    this.onAddedToQueue(entry);

    if (this.queueStatus === DownloadStatus.IDLE || this.queueStatus === DownloadStatus.DONE) {
      this.processDownloadQueue();
    }
  }

  private static setQueueStatus(status: DownloadStatus) {
    this.queueStatus = status;
    this.onStatusChange(status);
  }

  private static async processDownloadQueue() {
    let queueCompleted = false;

    const handleOnFail = (err: string | null) => {
      if (err === null) {
        return;
      }

      this.onFail(err);
    };

    const handleOnComplete = () => {
      this.onStageComplete();
    };

    while (!queueCompleted) {
      const entries = Object.values(this.queueMap);

      if (entries.length === 0) {
        this.setQueueStatus(DownloadStatus.DONE);
        queueCompleted = true;
        continue;
      }

      const entry = entries.shift();
      if (!entry) {
        continue;
      }

      this.queueMap = entries.reduce<Record<string, Entry>>((acc, currentEntry) => {
        if (currentEntry.id === entry?.id) {
          return acc;
        }
        acc[currentEntry.id] = currentEntry;
        return acc;
      }, {});

      this.setQueueStatus(DownloadStatus.CONNECTING_TO_LIBGEN);

      const mirrorPageDocument = await attempt(
        () => getDocument(entry.mirror),
        handleOnFail,
        handleOnFail,
        handleOnComplete
      );

      if (!mirrorPageDocument) {
        continue;
      }

      const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument, handleOnFail);
      if (!downloadUrl) {
        this.setQueueStatus(DownloadStatus.FAILED);
        continue;
      }

      const downloadStream = await attempt(
        () => fetch(downloadUrl),
        handleOnFail,
        handleOnFail,
        handleOnComplete
      );
      if (!downloadStream) {
        continue;
      }

      try {
        this.setQueueStatus(DownloadStatus.DOWNLOADING);

        const downloadResult: DownloadResult = await downloadFile({
          downloadStream,
          onStart: (filename, total) => {
            this.onDownloadStart(filename, 0, total);
          },
          onData: (filename, chunk, total) => {
            this.onDownloadUpdate(filename, chunk.length, total);
          },
        });

        this.onDownloadComplete(downloadResult);
      } catch (error) {
        handleOnFail((error as Error).message);
        continue;
      }
    }
  }
}
