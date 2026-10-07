import { DOWNLOAD_SOURCE_ATTEMPT_COUNT, DOWNLOAD_SOURCE_TIMEOUT_MS } from "../../../src/settings";
import type { AttemptOptions } from "../../../src/utilities";
import type { FileSignature } from "./types";

export const REQUEST_TIMEOUT_MS = 60_000;
export const SIGNATURE_BYTES = 128;
export const RETRY_OPTIONS: AttemptOptions = {
  attemptCount: DOWNLOAD_SOURCE_ATTEMPT_COUNT,
  timeoutMs: DOWNLOAD_SOURCE_TIMEOUT_MS,
};

const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];

export const FILE_SIGNATURES = new Map<string, FileSignature[]>([
  ["pdf", [{ offset: 0, bytes: [...Buffer.from("%PDF")] }]],
  ["epub", [{ offset: 0, bytes: ZIP_SIGNATURE }]],
  ["cbz", [{ offset: 0, bytes: ZIP_SIGNATURE }]],
  ["zip", [{ offset: 0, bytes: ZIP_SIGNATURE }]],
  ["docx", [{ offset: 0, bytes: ZIP_SIGNATURE }]],
  ["djvu", [{ offset: 0, bytes: [...Buffer.from("AT&TFORM")] }]],
  ["mobi", [{ offset: 60, bytes: [...Buffer.from("BOOKMOBI")] }]],
  ["azw3", [{ offset: 60, bytes: [...Buffer.from("BOOKMOBI")] }]],
  ["chm", [{ offset: 0, bytes: [...Buffer.from("ITSF")] }]],
  ["rar", [{ offset: 0, bytes: [...Buffer.from("Rar!")] }]],
  ["cbr", [{ offset: 0, bytes: [...Buffer.from("Rar!")] }]],
  ["fb2", [{ offset: 0, bytes: [...Buffer.from("<?xml")] }]],
]);

export const HTML_PREFIX = /^\s*<(!doctype|html)/i;
