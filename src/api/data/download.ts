import contentDisposition from "content-disposition";
import fs from "fs";
import { Response } from "node-fetch";
import { DownloadResult } from "../models/DownloadResult";
import path from "path";

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
    const MAX_FILE_NAME_LENGTH = 128;

    const downloadContentDisposition = downloadStream.headers.get("content-disposition");
    if (!downloadContentDisposition) {
      reject(new Error("No content-disposition header found"));
      return;
    }

    const parsedContentDisposition = contentDisposition.parse(downloadContentDisposition);
    const fullFileName = parsedContentDisposition.parameters.filename;

    // Sanitize filename to handle special characters and spaces
    const sanitizedFileName = fullFileName.replace(/[<>:"/\\|?*]/g, '_');

    const slicedFileName = sanitizedFileName.slice(
      Math.max(sanitizedFileName.length - MAX_FILE_NAME_LENGTH, 0),
      sanitizedFileName.length
    );

    // Use path.join for better cross-platform compatibility
    const filePath = path.join(process.cwd(), slicedFileName);

    // Create write stream with error handling
    let file: fs.WriteStream;
    try {
      file = fs.createWriteStream(filePath);
    } catch (error) {
      reject(new Error(`Failed to create write stream: ${(error as Error).message}`));
      return;
    }

    const total = Number(downloadStream.headers.get("content-length") || 0);

    // Use sanitized filename consistently
    const filename = sanitizedFileName;

    if (!downloadStream.body) {
      file.close();
      reject(new Error("No response body found"));
      return;
    }

    onStart(filename, total);

    downloadStream.body.on("data", (chunk) => {
      onData(filename, chunk, total);
    });

    downloadStream.body.on("end", () => {
      file.end();
    });

    file.on("finish", () => {
      const downloadResult: DownloadResult = {
        path: filePath,
        filename,
        total,
      };

      resolve(downloadResult);
    });

    downloadStream.body.on("error", (error) => {
      file.close();
      reject(new Error(`(${filename}) Error occurred while downloading file: ${error.message}`));
    });

    file.on("error", (error) => {
      file.close();
      reject(new Error(`(${filename}) Error writing to file: ${error.message}`));
    });

    downloadStream.body.pipe(file);
  });
};

// Add support for multiple mirrors
export const downloadFileWithMirrorFallback = async ({
  mirrors,
  getDownloadStreamFn,
  onStart,
  onData,
  onMirrorFallback,
}: {
  mirrors: string[];
  getDownloadStreamFn: (mirror: string) => Promise<Response>;
  onStart: (filename: string, total: number) => void;
  onData: (filename: string, chunk: Buffer, total: number) => void;
  onMirrorFallback?: (failedMirror: string, nextMirror: string, error: Error) => void;
}): Promise<DownloadResult> => {
  let lastError: Error | null = null;

  for (let i = 0; i < mirrors.length; i++) {
    const currentMirror = mirrors[i];

    try {
      const downloadStream = await getDownloadStreamFn(currentMirror);

      return await downloadFile({
        downloadStream,
        onStart,
        onData,
      });
    } catch (error) {
      lastError = error as Error;

      if (i < mirrors.length - 1 && onMirrorFallback) {
        onMirrorFallback(currentMirror, mirrors[i + 1], lastError);
      }
    }
  }

  throw lastError || new Error('All mirrors failed to download the file');
};
