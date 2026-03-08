import { filesize } from "filesize";

export const getDownloadProgress = (progress: number, total: number) => {
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
};
