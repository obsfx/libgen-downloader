import { atom } from "jotai";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";

export const totalAddedToDownloadQueueAtom = atom(0);
export const totalDownloadedAtom = atom(0);
export const totalFailedAtom = atom(0);

export const downloadQueueMapAtom = atom<Record<string, Entry>>({});
export const downloadQueueStatusAtom = atom(DownloadStatus.IDLE);
export const currentDownloadProgressAtom = atom({
  filename: "",
  progress: 0,
  total: 0,
});

export const bulkDownloadMapAtom = atom<Record<string, Entry | null>>({});
