import React from "react";
import { Box } from "ink";
import ContentContainer from "../../components/ContentContainer";
import DetailRow from "./DetailRow";
import DetailEntryOptions from "./DetailEntryOptions";
import UsageInfo from "../../components/UsageInfo";
import { useBoundStore } from "../../store";
import ResultListInfo from "../../components/ResultListInfo";
import { DownloadStatusAndProgress } from "../../components/DownloadStatusAndProgress";

const Detail: React.FC = () => {
  const mirrorAdapter = useBoundStore((state) => state.mirrorAdapter);
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
        {Object.entries(detailedEntry)
          .filter(([key]) => mirrorAdapter?.isHiddenField(key))
          .map(([key, value], idx) => (
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
