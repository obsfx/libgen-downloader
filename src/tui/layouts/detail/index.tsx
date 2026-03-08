import type { FC } from "react";
import { Box } from "ink";
import ContentContainer from "../../components/content-container";
import DetailRow from "./detail-row";
import DetailEntryOptions from "./detail-entry-options";
import UsageInfo from "../../components/usage-info";
import { useBoundStore } from "../../store";
import ResultListInfo from "../../components/result-list-info";
import { DownloadStatusAndProgress } from "../../components/download-status-and-progress";

const Detail: FC = () => {
  const mirrorAdapter = useBoundStore((state) => state.mirrorAdapter);
  const detailedEntry = useBoundStore((state) => state.detailedEntry);

  const downloadProgressMap = useBoundStore((state) => state.downloadProgressMap);
  let downloadProgressData;
  if (detailedEntry) {
    downloadProgressData = downloadProgressMap[detailedEntry.id];
  }

  if (!detailedEntry) {
    return;
  }

  return (
    <Box flexDirection="column">
      <ResultListInfo />
      <ContentContainer>
        {Object.entries(detailedEntry)
          .filter(([key]) => mirrorAdapter?.isHiddenField(key))
          .map(([key, value], index) => {
            let label = `${key[0].toUpperCase()}${key.slice(1)}`;
            if (key === "id") {
              label = key.toUpperCase();
            }

            return (
              <DetailRow
                key={index}
                label={label}
                description={mirrorAdapter?.formatField(key, value) || value.toString()}
              />
            );
          })}

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
