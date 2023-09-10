import fetch from "node-fetch";
import { Config, findMirror } from "../../api/data/config";
import { getDocument } from "../../api/data/document";
import { downloadFile } from "../../api/data/download";
import { constructMD5SearchUrl, parseEntries } from "../../api/data/search";
import { findDownloadUrlFromMirror } from "../../api/data/url";
import { DownloadStatus } from "../../download-statuses";
import { attempt } from "../../utils";

export interface BulkDownloadState {
  md5: string;
  status: DownloadStatus;
  filename: string;
  progress: number;
  total: number;
}

export abstract class BulkDownloadManager {
  private static subscribeToBulkDownloadProgress: (
    bulkMap: Record<string, BulkDownloadState>
  ) => void;

  private static bulkMap: Record<string, BulkDownloadState> = {};
  private static appConfig: Config | null = null;

  public static registerAppConfig(appConfig: Config) {
    this.appConfig = appConfig;
  }

  public static registerEvents({
    subscribeToBulkDownloadProgress,
  }: {
    subscribeToBulkDownloadProgress: (bulkMap: Record<string, BulkDownloadState>) => void;
  }) {
    this.subscribeToBulkDownloadProgress = subscribeToBulkDownloadProgress;
  }

  private static initBulkMap(md5List: string[]) {
    this.bulkMap = md5List.reduce<Record<string, BulkDownloadState>>((acc, md5) => {
      acc[md5] = {
        md5,
        status: DownloadStatus.IN_QUEUE,
        filename: "",
        progress: 0,
        total: 0,
      };
      return acc;
    }, {});
  }

  private static updateBulkMap(md5: string, state: Partial<BulkDownloadState>) {
    this.bulkMap[md5] = {
      ...this.bulkMap[md5],
      ...state,
    };
    this.subscribeToBulkDownloadProgress(this.bulkMap);
  }

  public static async startBulkDownload(md5List: string[], mirror: string | null = null) {
    if (!this.appConfig) {
      throw new Error("App config is not registered");
    }

    if (!mirror) {
      const availableMirror = await findMirror(this.appConfig.mirrors, () => {
        console.log("Mirror not available");
      });

      if (!availableMirror) {
        console.log("Could not find any available mirror");
        return;
      }

      mirror = availableMirror;
    }

    this.initBulkMap(md5List);

    // We don't want to push logs for bulk download for now.
    // In future we can use them for crash reports.
    const handlePushLog = () => undefined;
    const handleClearLog = () => undefined;

    while (md5List.length > 0) {
      const md5 = md5List.shift() as string;
      const searchUrl = constructMD5SearchUrl(this.appConfig.searchByMD5Pattern, mirror, md5);

      const handleDownloadFail = () => {
        this.updateBulkMap(md5, {
          status: DownloadStatus.FAILED,
        });
      };

      const searchPageDocument = await attempt(
        () => getDocument(searchUrl),
        handlePushLog,
        handleClearLog,
        handleDownloadFail
      );

      if (!searchPageDocument) {
        continue;
      }

      const entries = parseEntries(searchPageDocument, handleDownloadFail);
      if (!entries) {
        continue;
      }

      const entry = entries[0];
      if (!entry) {
        handleDownloadFail();
        continue;
      }

      const mirrorPageDocument = await attempt(
        () => getDocument(entry.mirror),
        handlePushLog,
        handleDownloadFail,
        handleClearLog
      );
      if (!mirrorPageDocument) {
        continue;
      }

      const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument, handleDownloadFail);
      if (!downloadUrl) {
        continue;
      }

      const downloadStream = await attempt(
        () => fetch(downloadUrl),
        handlePushLog,
        handleDownloadFail,
        handleClearLog
      );
      if (!downloadStream) {
        continue;
      }

      try {
        await downloadFile({
          downloadStream,
          onStart: (filename, total) => {
            this.updateBulkMap(md5, {
              status: DownloadStatus.DOWNLOADING,
              filename,
              total,
            });
          },
          onData: (filename, chunk, total) => {
            this.updateBulkMap(md5, {
              filename,
              progress: this.bulkMap[md5].progress + chunk.length,
              total,
            });
          },
        });

        this.updateBulkMap(md5, {
          status: DownloadStatus.DONE,
        });
      } catch (err) {
        handleDownloadFail();
      }
    }
  }
}
