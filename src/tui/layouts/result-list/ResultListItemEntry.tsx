import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { useResultListContext } from "../../contexts/ResultListContext";
import { ResultListEntryOption } from "../../../options";
import Label from "../../../labels";
import { IResultListItemEntry } from "../../../api/models/ListItem";
import { SEARCH_PAGE_SIZE } from "../../../settings";
import { useBoundStore } from "../../store/index";
import { DownloadStatusAndProgress } from "../../components/DownloadStatusAndProgress";

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

  const { handleSeeDetailsOptions, handleTurnBackToTheListOption } = useResultListContext();
  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);
  const [alternativeDownloadURLs, setAlternativeDownloadURLs] = useState<string[]>([]);
  const [alternativeDownloadURLsLoading, setAlternativeDownloadURLsLoading] = useState(false);

  const toggleBulkDownload = () => {
    if (inBulkDownloadQueue) {
      removeFromBulkDownloadQueue(item.data.id);
      return;
    }

    addToBulkDownloadQueue(item.data);
  };

  const entryOptions: Record<string, IOption> = {
    [ResultListEntryOption.SEE_DETAILS]: {
      label: Label.SEE_DETAILS,
      onSelect: () => handleSeeDetailsOptions(item.data),
    },
    [ResultListEntryOption.DOWNLOAD_DIRECTLY]: {
      loading: inDownloadQueue,
      label: inDownloadQueue ? Label.DOWNLOADING : Label.DOWNLOAD_DIRECTLY,
      description: "(Press [D])",
      onSelect: () => {
        pushDownloadQueue(item.data);
      },
    },
    [ResultListEntryOption.ALTERNATIVE_DOWNLOADS]: {
      label: `${Label.ALTERNATIVE_DOWNLOADS} (${alternativeDownloadURLs.length})`,
      loading: alternativeDownloadURLsLoading || inDownloadQueue,
      onSelect: () => {
        setActiveExpandedListLength(alternativeDownloadURLs.length + 1);
        setShowAlternativeDownloads(true);
      },
    },
    [ResultListEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: inBulkDownloadQueue
        ? Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE
        : Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
      description: "(Press [TAB])",
      onSelect: () => {
        toggleBulkDownload();
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
    (input, key) => {
      if (key.return && !isExpanded) {
        setAnyEntryExpanded(true);
        setActiveExpandedListLength(Object.keys(entryOptions).length);
        return;
      }

      if (key.tab) {
        toggleBulkDownload();
        return;
      }

      if (input.toLowerCase() === "d") {
        pushDownloadQueue(item.data);
        return;
      }
    },
    { isActive }
  );

  useEffect(() => {
    if (!isExpanded || alternativeDownloadURLs.length > 0) {
      return;
    }

    let isMounted = true;

    const fetchDownloadUrls = async () => {
      setAlternativeDownloadURLsLoading(true);
      const alternativeDownloadURLs = await fetchEntryAlternativeDownloadURLs(item.data);

      if (!isMounted) {
        return;
      }

      setAlternativeDownloadURLs(alternativeDownloadURLs);
      setAlternativeDownloadURLsLoading(false);
    };

    fetchDownloadUrls();

    return () => {
      isMounted = false;
    };
  }, [isExpanded, item.data, fetchEntryAlternativeDownloadURLs, alternativeDownloadURLs]);

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "cyanBright" : ""}
      >
        {isActive && !isExpanded && figures.pointer}
        {inBulkDownloadQueue && <Text color="green"> {figures.tick} </Text>}
        <Text>[{item.order + (currentPage - 1) * SEARCH_PAGE_SIZE}] </Text>
        {downloadProgressData && (
          <DownloadStatusAndProgress downloadProgressData={downloadProgressData} />
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
