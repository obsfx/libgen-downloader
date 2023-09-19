import fetch from "node-fetch";
//impor { getDocument } from "../../api/data/document";
//import { downloadFile } from "../../api/data/download";
//import { findDownloadUrlFromMirror } from "../../api/data/url";
//import { DownloadResult } from "../../api/models/DownloadResult";
//import { Entry } from "../../api/models/Entry";
//import { DownloadStatus } from "../../download-statuses";
//import { attempt } from "../../utils";
//
//export abstract class StandardDownloadManager {
//  private static onFail: (message: string) => void;
//  private static onStatusChange: (status: DownloadStatus) => void;
//  private static onStageComplete: () => void;
//  private static onAddedToQueue: (entry: Entry) => void;
//  private static onDownloadStart: (filename: string, chunkSize: number, total: number) => void;
//  private static onDownloadUpdate: (filename: string, chunkSize: number, total: number) => void;
//  private static onDownloadComplete: (downloadResult: DownloadResult) => void;
//  private static onDownloadFail: () => void;
//  private static subscribeToDownloadQueueMap: (queueMap: Record<string, Entry>) => void;
//
//  private static queueMap: Record<string, Entry> = {};
//  private static queueStatus: DownloadStatus = DownloadStatus.IDLE;
//
//  public static registerEvents({
//    onFail,
//    onStatusChange,
//    onStageComplete,
//    onAddedToQueue,
//    onDownloadStart,
//    onDownloadUpdate,
//    onDownloadComplete,
//    onDownloadFail,
//    subscribeToDownloadQueueMap,
//  }: {
//    onFail: (message: string) => void;
//    onStatusChange: (status: DownloadStatus) => void;
//    onStageComplete: () => void;
//    onAddedToQueue: (entry: Entry) => void;
//    onDownloadStart: (filename: string, chunkSize: number, total: number) => void;
//    onDownloadUpdate: (filename: string, chunkSize: number, total: number) => void;
//    onDownloadComplete: (downloadResult: DownloadResult) => void;
//    onDownloadFail: () => void;
//    subscribeToDownloadQueueMap: (queueMap: Record<string, Entry>) => void;
//  }) {
//    this.onFail = onFail;
//    this.onStatusChange = onStatusChange;
//    this.onStageComplete = onStageComplete;
//    this.onAddedToQueue = onAddedToQueue;
//    this.onDownloadStart = onDownloadStart;
//    this.onDownloadUpdate = onDownloadUpdate;
//    this.onDownloadComplete = onDownloadComplete;
//    this.onDownloadFail = onDownloadFail;
//    this.subscribeToDownloadQueueMap = subscribeToDownloadQueueMap;
//  }
//
//  public static pushToDownloadQueueMap(entry: Entry): void {
//    if (this.queueMap[entry.id]) {
//      return;
//    }
//
//    this.queueMap[entry.id] = entry;
//    this.subscribeToDownloadQueueMap(this.queueMap);
//    this.onAddedToQueue(entry);
//
//    if (this.queueStatus === DownloadStatus.IDLE || this.queueStatus === DownloadStatus.DONE) {
//      this.processDownloadQueue();
//    }
//  }
//
//  private static removeEntryFromQueueMap(entry: Entry) {
//    delete this.queueMap[entry.id];
//    this.subscribeToDownloadQueueMap(this.queueMap);
//  }
//
//  private static setQueueStatus(status: DownloadStatus) {
//    this.queueStatus = status;
//    this.onStatusChange(status);
//  }
//
//  private static async processDownloadQueue() {
//    let queueCompleted = false;
//
//    const handleDownloadFail = () => {
//      this.setQueueStatus(DownloadStatus.FAILED);
//      this.onDownloadFail();
//    };
//
//    const handleOnFail = (err: string | null) => {
//      if (err === null) {
//        return;
//      }
//
//      this.onFail(err);
//    };
//
//    const handleOnComplete = () => {
//      this.onStageComplete();
//    };
//
//    while (!queueCompleted) {
//      const entries = Object.values(this.queueMap);
//
//      if (entries.length === 0) {
//        this.setQueueStatus(DownloadStatus.DONE);
//        queueCompleted = true;
//        continue;
//      }
//
//      const entry = entries.shift();
//      if (!entry) {
//        continue;
//      }
//
//      this.setQueueStatus(DownloadStatus.CONNECTING_TO_LIBGEN);
//
//      let downloadUrl: string | null | undefined = "";
//      if (entry.alternativeDirectDownloadUrl !== undefined) {
//        downloadUrl = entry.alternativeDirectDownloadUrl;
//      } else {
//        const mirrorPageDocument = await attempt(
//          () => getDocument(entry.mirror),
//          handleOnFail,
//          handleDownloadFail,
//          handleOnComplete
//        );
//
//        if (!mirrorPageDocument) {
//          continue;
//        }
//
//        downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument, handleDownloadFail);
//      }
//
//      if (!downloadUrl) {
//        continue;
//      }
//
//      const downloadStream = await attempt(
//        () => fetch(downloadUrl as string),
//        handleOnFail,
//        handleDownloadFail,
//        handleOnComplete
//      );
//      if (!downloadStream) {
//        continue;
//      }
//
//      try {
//        this.setQueueStatus(DownloadStatus.DOWNLOADING);
//
//        const downloadResult: DownloadResult = await downloadFile({
//          downloadStream,
//          onStart: (filename, total) => {
//            this.onDownloadStart(filename, 0, total);
//          },
//          onData: (filename, chunk, total) => {
//            this.onDownloadUpdate(filename, chunk.length, total);
//          },
//        });
//
//        this.onDownloadComplete(downloadResult);
//      } catch (error) {
//        handleDownloadFail();
//      } finally {
//        this.removeEntryFromQueueMap(entry);
//      }
//    }
//  }
//}
