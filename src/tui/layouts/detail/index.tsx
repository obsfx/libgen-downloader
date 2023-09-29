import React from "react";
import { Box } from "ink";
import ContentContainer from "../../components/ContentContainer.js";
import DetailRow from "./DetailRow.js";
import DetailEntryOptions from "./DetailEntryOptions.js";
import UsageInfo from "../../components/UsageInfo.js";
import { useBoundStore } from "../../store/index.js";
import ResultListInfo from "../../components/ResultListInfo.js";
import { DownloadStatusAndProgress } from "../../components/DownloadStatusAndProgress.js";

const Detail: React.FC = () => {
  const detailedEntry = useBoundStore((state) => state.detailedEntry);

  const downloadProgressMap = useBoundStore((state) => state.downloadProgressMap);
  const downloadProgressData = detailedEntry ? downloadProgressMap[detailedEntry.id] : undefined;

  if (!detailedEntry) {
    return null;
  }

  return (
    <Box flexDirection="column">
      <ResultListInfo />
      <ContentContainer>
        {Object.entries(detailedEntry).map(([key, value], idx) => (
          <DetailRow
            key={idx}
            label={key === "id" ? key.toUpperCase() : `${key[0].toUpperCase()}${key.slice(1)}`}
            description={value}
          />
        ))}

        {downloadProgressData && (
          <Box paddingLeft={3}>
            <DownloadStatusAndProgress downloadProgressData={downloadProgressData} />
          </Box>
        )}
        <DetailEntryOptions />
      </ContentContainer>
      <UsageInfo />
    </Box>
  );
};

export default Detail;
