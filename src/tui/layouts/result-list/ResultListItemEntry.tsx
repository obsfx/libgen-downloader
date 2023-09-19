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
import { AppEvent, EventManager } from "../../classes/EventEmitterManager.js";
import { useBoundStore } from "../../store/index.js";

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

  const { pushLog, clearLog } = useLogContext();
  const { handleSeeDetailsOptions, handleTurnBackToTheListOption } = useResultListContext();
  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);
  const [alternativeDownloadURLs, setAlternativeDownloadURLs] = useState<string[]>([]);

  const inDownloadQueueEntryIds = useBoundStore((state) => state.inDownloadQueueEntryIds);
  const inDownloadQueue = inDownloadQueueEntryIds.includes(item.data.id);

  const bulkDownloadSelectedEntryIds = useBoundStore((state) => state.bulkDownloadSelectedEntryIds);
  const inBulkDownloadQueue = bulkDownloadSelectedEntryIds.includes(item.data.id);

  const entryOptions: Record<string, IOption> = useMemo(
    () => ({
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
    }),
    [
      alternativeDownloadURLs,
      handleSeeDetailsOptions,
      handleTurnBackToTheListOption,
      item.data,
      setActiveExpandedListLength,
      inDownloadQueue,
      inBulkDownloadQueue,
      addToBulkDownloadQueue,
      removeFromBulkDownloadQueue,
    ]
  );

  const alternativeDownloadOptions = useMemo(
    () => ({
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
    }),
    [alternativeDownloadURLs, setActiveExpandedListLength, entryOptions, item.data]
  );

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
    let isMounted = true;

    if (!isExpanded || alternativeDownloadURLs.length > 0) {
      return;
    }

    const fetchDownloadUrls = async () => {
      const pageDocument = await attempt(
        () => getDocument(item.data.mirror),
        pushLog,
        (error) => EventManager.emit(AppEvent.THROW_ERROR, error),
        clearLog
      );

      if (!pageDocument || !isMounted) {
        return;
      }

      const parsedDownloadUrls = parseDownloadUrls(pageDocument, (error: string) =>
        EventManager.emit(AppEvent.THROW_ERROR, error)
      );

      if (!parsedDownloadUrls) {
        return;
      }

      setAlternativeDownloadURLs(parsedDownloadUrls);
    };

    fetchDownloadUrls();

    return () => {
      isMounted = false;
    };
  }, [
    isExpanded,
    item.data,
    item.data.mirror,
    pushLog,
    clearLog,
    setActiveExpandedListLength,
    entryOptions,
    alternativeDownloadURLs,
    handleSeeDetailsOptions,
  ]);

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "cyanBright" : ""}
        bold={isActive}
      >
        {isActive && !isExpanded && figures.pointer} [
        {item.order + (currentPage - 1) * SEARCH_PAGE_SIZE}]{" "}
        {inDownloadQueue && <Text color="yellow">(In download queue) </Text>}
        <Text color={isFadedOut ? "gray" : "green"} bold={true}>
          {item.data.extension}
        </Text>{" "}
        {item.data.title}
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
