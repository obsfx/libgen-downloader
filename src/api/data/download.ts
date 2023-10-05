import contentDisposition from "content-disposition";
import fs from "fs";
import { Response } from "node-fetch";
import { DownloadResult } from "../models/DownloadResult";

interface downloadFileArgs {
  downloadStream: Response;
  onStart: (filename: string, total: number) => void;
  onData: (filename: string, chunk: Buffer, total: number) => void;
}

export const downloadFile = async ({
  downloadStream,
  onStart,
  onData,
}: downloadFileArgs): Promise<DownloadResult> => {
  return new Promise((resolve, reject) => {
    const downloadContentDisposition = downloadStream.headers.get("content-disposition");
    if (!downloadContentDisposition) {
      reject(new Error("No content-disposition header found"));
      return;
    }

    const parsedContentDisposition = contentDisposition.parse(downloadContentDisposition);
    const path = `./${parsedContentDisposition.parameters.filename}`;
    const file: fs.WriteStream = fs.createWriteStream(path);
    const total = Number(downloadStream.headers.get("content-length") || 0);
    const filename = parsedContentDisposition.parameters.filename;

    if (!downloadStream.body) {
      return;
    }

    onStart(filename, total);

    downloadStream.body.on("data", (chunk) => {
      onData(filename, chunk, total);
    });

    downloadStream.body.on("finish", () => {
      const downloadResult: DownloadResult = {
        path,
        filename,
        total,
      };

      resolve(downloadResult);
    });

    downloadStream.body.on("error", () => {
      reject(new Error(`(${filename}) Error occurred while downloading file`));
    });

    downloadStream.body.pipe(file);
  });
};
