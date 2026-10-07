import contentDisposition from "content-disposition";
import fs from "node:fs";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { FileDownloadError } from "../../errors";
import type { DownloadResult } from "../models/download-result";

interface downloadFileArguments {
  downloadStream: Response;
  onStart: (filename: string, total: number) => void;
  onData: (filename: string, chunk: Buffer, total: number) => void;
}

export const downloadFile = async ({
  downloadStream,
  onStart,
  onData,
}: downloadFileArguments): Promise<DownloadResult> => {
  const MAX_FILE_NAME_LENGTH = 128;

  const downloadContentDisposition = downloadStream.headers.get("content-disposition");
  if (!downloadContentDisposition) {
    throw new FileDownloadError("No content-disposition header found");
  }

  const parsedContentDisposition = contentDisposition.parse(downloadContentDisposition);
  const fullFileName = parsedContentDisposition.parameters.filename;
  const slicedFileName = fullFileName.slice(
    Math.max(fullFileName.length - MAX_FILE_NAME_LENGTH, 0)
  );
  const path = `./${slicedFileName}`;

  const total = Number(downloadStream.headers.get("content-length") || 0);
  const filename = parsedContentDisposition.parameters.filename;

  if (!downloadStream.body) {
    throw new FileDownloadError("No response body");
  }

  onStart(filename, total);

  const progressStream = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      const buffer = Buffer.from(chunk);
      onData(filename, buffer, total);
      callback(undefined, buffer);
    },
  });

  try {
    await pipeline(
      Readable.from(downloadStream.body, { objectMode: false }),
      progressStream,
      fs.createWriteStream(path)
    );

    const downloadResult: DownloadResult = {
      path,
      filename,
      total,
    };

    return downloadResult;
  } catch {
    throw new FileDownloadError(`(${filename}) Error occurred while downloading file`);
  }
};
