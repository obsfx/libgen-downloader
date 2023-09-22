import React from "react";
import { Box, Text } from "ink";
import ContentContainer from "../../components/ContentContainer.js";
import DetailRow from "./DetailRow.js";
import DetailEntryOptions from "./DetailEntryOptions.js";
import UsageInfo from "../../components/UsageInfo.js";
import { useBoundStore } from "../../store/index.js";
import { getDownloadProgress } from "../../helpers/progress.js";
import { downloadStatusIndicators } from "../../../download-statuses.js";

const Detail: React.FC = () => {
  const detailedEntry = useBoundStore((state) => state.detailedEntry);

  const downloadProgressMap = useBoundStore((state) => state.downloadProgressMap);
  const downloadProgressData = detailedEntry ? downloadProgressMap[detailedEntry.id] : undefined;
  const downloadProgress = downloadProgressData
    ? getDownloadProgress(downloadProgressData.progress || 0, downloadProgressData.total)
    : null;

  if (!detailedEntry) {
    return null;
  }

  return (
    <Box flexDirection="column">
      <ContentContainer>
        {Object.entries(detailedEntry)
          .filter(([key]) => key !== "downloadUrls")
          .map(([key, value], idx) => (
            <DetailRow
              key={idx}
              label={key === "id" ? key.toUpperCase() : `${key[0].toUpperCase()}${key.slice(1)}`}
              description={value}
            />
          ))}

        {downloadProgressData && (
          <Box paddingLeft={3}>
            <Text>
              {downloadStatusIndicators[downloadProgressData.status]}{" "}
              <Text color="magenta">
                {downloadProgress?.progressPercentage}% {downloadProgress?.downloadedSize} /{" "}
                {downloadProgress?.totalSize}
              </Text>{" "}
            </Text>
          </Box>
        )}
        <DetailEntryOptions />
      </ContentContainer>
      <UsageInfo />
    </Box>
  );
};

export default Detail;
