import { filesize } from "filesize";

const SECONDS_PER_MINUTE = 60;

export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function getDownloadProgress(progress: number, total: number) {
  let rawPercentage = 0;
  if (total !== 0) {
    rawPercentage = (progress / total) * 100;
  }
  const progressPercentage = rawPercentage.toFixed(2);

  const downloadedSize = filesize(progress, {
    base: 2,
    standard: "jedec",
  });

  const totalSize = filesize(total, {
    base: 2,
    standard: "jedec",
  });

  return {
    progressPercentage,
    downloadedSize,
    totalSize,
  };
}

export function clearScreen(): void {
  let clearANSI = "\u001B[2J";
  if (process.platform === "win32") {
    clearANSI = "u001b[H\u001Bc";
  }
  // reset screen pos
  process.stdout.write("\u001B[1;1H");
  // clear screen
  process.stdout.write(clearANSI);
}
