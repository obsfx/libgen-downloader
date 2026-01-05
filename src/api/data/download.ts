import contentDisposition from "content-disposition";
import fs from "fs";
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
  const MAX_FILE_NAME_LENGTH = 128;

  const downloadContentDisposition = downloadStream.headers.get("content-disposition");
  if (!downloadContentDisposition) {
    throw new Error("No content-disposition header found");
  }

  const parsedContentDisposition = contentDisposition.parse(downloadContentDisposition);
  const fullFileName = parsedContentDisposition.parameters.filename;
  const slicedFileName = fullFileName.slice(
    Math.max(fullFileName.length - MAX_FILE_NAME_LENGTH, 0),
    fullFileName.length
  );
  const path = `./${slicedFileName}`;

  const total = Number(downloadStream.headers.get("content-length") || 0);
  const filename = parsedContentDisposition.parameters.filename;

  if (!downloadStream.body) {
    throw new Error("No response body");
  }

  onStart(filename, total);

  const file = fs.createWriteStream(path);
  const reader = downloadStream.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = Buffer.from(value);
      file.write(chunk);
      onData(filename, chunk, total);
    }

    file.end();

    await new Promise<void>((resolve, reject) => {
      file.on("finish", resolve);
      file.on("error", reject);
    });

    const downloadResult: DownloadResult = {
      path,
      filename,
      total,
    };

    return downloadResult;
  } catch (error) {
    file.destroy();
    throw new Error(`(${filename}) Error occurred while downloading file`);
  }
};
