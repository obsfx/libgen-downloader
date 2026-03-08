import type { FC } from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";
import { IOption } from "../../components/option";
import OptionList from "../../components/option-list";
import { useResultListContext } from "../../contexts/result-list-context";
import { ResultListEntryOption } from "../../../options";
import Label from "../../../labels";
import { IResultListItemEntry } from "../../../api/models/list-item";
import { SEARCH_PAGE_SIZE } from "../../../settings";
import { useBoundStore } from "../../store";
import { DownloadStatusAndProgress } from "../../components/download-status-and-progress";
import objectHash from "object-hash";

const ResultListItemEntry: FC<{
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

  let downloadLabel = Label.DOWNLOAD_DIRECTLY;
  if (inDownloadQueue) {
    downloadLabel = Label.DOWNLOADING;
  }

  let bulkDownloadLabel = Label.ADD_TO_BULK_DOWNLOAD_QUEUE;
  if (inBulkDownloadQueue) {
    bulkDownloadLabel = Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE;
  }

  const entryOptions: Record<string, IOption> = {
    [ResultListEntryOption.SEE_DETAILS]: {
      label: Label.SEE_DETAILS,
      onSelect: () => handleSeeDetailsOptions(item.data),
    },
    [ResultListEntryOption.DOWNLOAD_DIRECTLY]: {
      loading: inDownloadQueue,
      label: downloadLabel,
      description: "(Press [D])",
      onSelect: () => {
        pushDownloadQueue(item.data);
      },
    },
    [ResultListEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: bulkDownloadLabel,
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

  let paddingLeft = 0;
  if (isExpanded) {
    paddingLeft = 1;
  }

  let entryColor = "";
  if (isFadedOut) {
    entryColor = "gray";
  } else if (isExpanded) {
    entryColor = "cyanBright";
  } else if (isActive) {
    entryColor = "cyanBright";
  }

  let pointer = " ";
  if (isActive && !isExpanded) {
    pointer = figures.pointer;
  }

  let extensionColor = "green";
  if (isFadedOut) {
    extensionColor = "gray";
  }

  return (
    <Box flexDirection="column" paddingLeft={paddingLeft}>
      <Text wrap="truncate" color={entryColor}>
        {pointer}
        {inBulkDownloadQueue && <Text color="green"> {figures.tick} </Text>}
        <Text>[{item.order + (currentPage - 1) * SEARCH_PAGE_SIZE}] </Text>
        {downloadProgressData && (
          <DownloadStatusAndProgress downloadProgressData={downloadProgressData} />
        )}
        <Text color={extensionColor} bold={true}>
          {item.data.extension}
        </Text>{" "}
        <Text bold={isActive}>{item.data.title}</Text>
      </Text>

      {isExpanded && <OptionList key={"entryOptions"} options={entryOptions} />}
    </Box>
  );
};

export default ResultListItemEntry;
