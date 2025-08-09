import React from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { useResultListContext } from "../../contexts/ResultListContext";
import { ResultListEntryOption } from "../../../options";
import Label from "../../../labels";
import { IResultListItemEntry } from "../../../api/models/ListItem";
import { SEARCH_PAGE_SIZE } from "../../../settings";
import { useBoundStore } from "../../store";
import { DownloadStatusAndProgress } from "../../components/DownloadStatusAndProgress";
import objectHash from "object-hash";

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

  const inDownloadQueueEntryIds = useBoundStore((state) => state.inDownloadQueueEntryIds);
  const inDownloadQueue = inDownloadQueueEntryIds.includes(item.data.id);

  const bulkDownloadSelectedEntries = useBoundStore((state) => state.bulkDownloadSelectedEntries);
  const inBulkDownloadQueue = bulkDownloadSelectedEntries[objectHash(item.data)];

  const downloadProgressMap = useBoundStore((state) => state.downloadProgressMap);
  const downloadProgressData = downloadProgressMap[item.data.id];

  const { handleSeeDetailsOptions, handleTurnBackToTheListOption } = useResultListContext();

  const toggleBulkDownload = () => {
    if (inBulkDownloadQueue) {
      removeFromBulkDownloadQueue(item.data);
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

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "cyanBright" : ""}
      >
        {isActive && !isExpanded ? figures.pointer : " "}
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

      {isExpanded && <OptionList key={"entryOptions"} options={entryOptions} />}
    </Box>
  );
};

export default ResultListItemEntry;
