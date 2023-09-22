import React, { useEffect, useState, useMemo } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { IOption } from "../../components/Option.js";
import OptionList from "../../components/OptionList.js";
import { useLogContext } from "../../contexts/LogContext.js";
import { useResultListContext } from "../../contexts/ResultListContext.js";
import { ResultListEntryOption } from "../../../options.js";
import Label from "../../../labels.js";
import { parseDownloadUrls } from "../../../api/data/url.js";
import { getDocument } from "../../../api/data/document.js";
import { IResultListItemEntry } from "../../../api/models/ListItem.js";
import { attempt } from "../../../utils.js";
import { SEARCH_PAGE_SIZE } from "../../../settings.js";
import { useBoundStore } from "../../store/index.js";
import { getDownloadProgress } from "../../helpers/progress.js";
import { downloadStatusIndicators } from "../../../download-statuses.js";

const ResultListItemEntry: React.FC<{
  item: IResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
  isFadedOut: boolean;
}> = ({ item, isActive, isExpanded, isFadedOut }) => {
  const addToBulkDownloadQueue = useBoundStore((state) => state.addToBulkDownloadQueue);
  const removeFromBulkDownloadQueue = useBoundStore((state) => state.removeFromBulkDownloadQueue);
  const currentPage = useBoundStore((state) => state.currentPage);
  const setAnyEntryExpanded = useBoundStore((state) => state.setAnyEntryExpanded);
  const setActiveExpandedListLength = useBoundStore((state) => state.setActiveExpandedListLength);
  const pushDownloadQueue = useBoundStore((state) => state.pushDownloadQueue);
  const fetchEntryAlternativeDownloadURLs = useBoundStore(
    (state) => state.fetchEntryAlternativeDownloadURLs
  );

  const inDownloadQueueEntryIds = useBoundStore((state) => state.inDownloadQueueEntryIds);
  const inDownloadQueue = inDownloadQueueEntryIds.includes(item.data.id);

  const bulkDownloadSelectedEntryIds = useBoundStore((state) => state.bulkDownloadSelectedEntryIds);
  const inBulkDownloadQueue = bulkDownloadSelectedEntryIds.includes(item.data.id);

  const downloadProgressMap = useBoundStore((state) => state.downloadProgressMap);
  const downloadProgressData = downloadProgressMap[item.data.id];
  const downloadProgress = downloadProgressData
    ? getDownloadProgress(downloadProgressData.progress || 0, downloadProgressData.total)
    : null;

  const { pushLog, clearLog } = useLogContext();
  const { handleSeeDetailsOptions, handleTurnBackToTheListOption } = useResultListContext();
  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);
  const [alternativeDownloadURLs, setAlternativeDownloadURLs] = useState<string[]>([]);

  const entryOptions: Record<string, IOption> = {
    [ResultListEntryOption.SEE_DETAILS]: {
      label: Label.SEE_DETAILS,
      onSelect: () =>
        handleSeeDetailsOptions({
          ...item.data,
          downloadUrls: alternativeDownloadURLs,
        }),
    },
    [ResultListEntryOption.DOWNLOAD_DIRECTLY]: {
      loading: inDownloadQueue,
      label: inDownloadQueue ? Label.DOWNLOADING : Label.DOWNLOAD_DIRECTLY,
      onSelect: () => {
        pushDownloadQueue(item.data);
      },
    },
    [ResultListEntryOption.ALTERNATIVE_DOWNLOADS]: {
      label: `${Label.ALTERNATIVE_DOWNLOADS} (${alternativeDownloadURLs.length})`,
      loading: alternativeDownloadURLs.length === 0 || inDownloadQueue,
      onSelect: () => {
        setActiveExpandedListLength(alternativeDownloadURLs.length + 1);
        setShowAlternativeDownloads(true);
      },
    },
    [ResultListEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: inBulkDownloadQueue
        ? Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE
        : Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
      onSelect: () => {
        if (inBulkDownloadQueue) {
          removeFromBulkDownloadQueue(item.data.id);
          return;
        }

        addToBulkDownloadQueue(item.data);
      },
    },
    [ResultListEntryOption.TURN_BACK_TO_THE_LIST]: {
      label: Label.TURN_BACK_TO_THE_LIST,
      onSelect: handleTurnBackToTheListOption,
    },
  };

  const alternativeDownloadOptions = {
    ...alternativeDownloadURLs.reduce<Record<string, IOption>>((prev, current, idx) => {
      return {
        ...prev,
        [idx]: {
          label: `(${idx + 1}) ${current}`,
          onSelect: () => {
            pushDownloadQueue({
              ...item.data,
              alternativeDirectDownloadUrl: current,
            });
            setShowAlternativeDownloads(false);
            setActiveExpandedListLength(Object.keys(entryOptions).length);
          },
        },
      };
    }, {}),
    [ResultListEntryOption.BACK_TO_ENTRY_OPTIONS]: {
      label: Label.BACK_TO_ENTRY_OPTIONS,
      onSelect: () => {
        setShowAlternativeDownloads(false);
        setActiveExpandedListLength(Object.keys(entryOptions).length);
      },
    },
  };

  useInput(
    (_, key: Key) => {
      if (key.return) {
        setAnyEntryExpanded(true);
        setActiveExpandedListLength(Object.keys(entryOptions).length);
      }
    },
    { isActive: isActive && !isExpanded }
  );

  useEffect(() => {
    if (!isExpanded || alternativeDownloadURLs.length > 0) {
      return;
    }

    const fetchDownloadUrls = async () => {
      const alternativeDownloadURLs = await fetchEntryAlternativeDownloadURLs(item.data);
      setAlternativeDownloadURLs(alternativeDownloadURLs);
    };

    fetchDownloadUrls();
  }, [isExpanded, item.data]);

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "cyanBright" : ""}
      >
        {isActive && !isExpanded && figures.pointer} [
        {item.order + (currentPage - 1) * SEARCH_PAGE_SIZE}]{" "}
        {downloadProgressData && (
          <>
            {downloadStatusIndicators[downloadProgressData.status]}{" "}
            <Text color="magenta">
              {downloadProgress?.progressPercentage}% {downloadProgress?.downloadedSize} /{" "}
              {downloadProgress?.totalSize}
            </Text>{" "}
          </>
        )}
        <Text color={isFadedOut ? "gray" : "green"} bold={true}>
          {item.data.extension}
        </Text>{" "}
        <Text bold={isActive}>{item.data.title}</Text>
      </Text>

      {isExpanded &&
        (showAlternativeDownloads ? (
          <OptionList key={"alternativeDownloads"} options={alternativeDownloadOptions} />
        ) : (
          <OptionList key={"entryOptions"} options={entryOptions} />
        ))}
    </Box>
  );
};

export default ResultListItemEntry;
