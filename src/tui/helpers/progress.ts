import { filesize } from "filesize";

export const getDownloadProgress = (progress: number, total: number) => {
  const progressPercentage = (total === 0 ? 0 : (progress / total) * 100).toFixed(2);

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
