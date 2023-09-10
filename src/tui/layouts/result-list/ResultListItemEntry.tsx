import React, { useEffect, useState, useMemo } from "react";
import { Box, Text, useInput, Key } from "ink";
import InkSpinner from "ink-spinner";
import figures from "figures";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { useErrorContext } from "../../contexts/ErrorContext";
import { useLogContext } from "../../contexts/LogContext";
import { useResultListContext } from "../../contexts/ResultListContext";
import { ResultListEntryOption } from "../../../options";
import Label from "../../../labels";
import { parseDownloadUrls } from "../../../api/data/url";
import { getDocument } from "../../../api/data/document";
import { IResultListItemEntry } from "../../../api/models/ListItem";
import { attempt } from "../../../utils";
import { SEARCH_PAGE_SIZE } from "../../../settings";
import { StandardDownloadManager } from "../../classes/StandardDownloadManager";
import { useAtom } from "jotai";
import {
  activeExpandedListLengthAtom,
  anyEntryExpandedAtom,
  currentPageAtom,
} from "../../store/app";
import { bulkDownloadMapAtom, downloadQueueMapAtom } from "../../store/download";

const ResultListItemEntry: React.FC<{
  item: IResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
  isFadedOut: boolean;
}> = ({ item, isActive, isExpanded, isFadedOut }) => {
  const [bulkDownloadMap] = useAtom(bulkDownloadMapAtom);
  const [downloadQueueMap] = useAtom(downloadQueueMapAtom);

  const [currentPage] = useAtom(currentPageAtom);
  const [, setAnyEntryExpanded] = useAtom(anyEntryExpandedAtom);
  const [, setActiveExpandedListLength] = useAtom(activeExpandedListLengthAtom);

  const { throwError } = useErrorContext();
  const { pushLog, clearLog } = useLogContext();

  const { handleSeeDetailsOptions, handleBulkDownloadQueueOption, handleTurnBackToTheListOption } =
    useResultListContext();

  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);
  const [alternativeDownloadURLs, setAlternativeDownloadURLs] = useState<string[]>([]);

  const inDownloadQueue = !!downloadQueueMap[item.data.id];

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
        onSelect: () => StandardDownloadManager.pushToDownloadQueueMap(item.data),
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
        label: bulkDownloadMap[item.data.id]
          ? Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE
          : Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
        onSelect: () => handleBulkDownloadQueueOption(item.data),
      },
      [ResultListEntryOption.TURN_BACK_TO_THE_LIST]: {
        label: Label.TURN_BACK_TO_THE_LIST,
        onSelect: handleTurnBackToTheListOption,
      },
    }),
    [
      alternativeDownloadURLs,
      bulkDownloadMap,
      handleSeeDetailsOptions,
      handleBulkDownloadQueueOption,
      handleTurnBackToTheListOption,
      item.data,
      setActiveExpandedListLength,
      inDownloadQueue,
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
              StandardDownloadManager.pushToDownloadQueueMap({
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
        throwError,
        clearLog
      );

      if (!pageDocument || !isMounted) {
        return;
      }

      const parsedDownloadUrls = parseDownloadUrls(pageDocument, throwError);

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
    throwError,
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
        {inDownloadQueue && (
          <Text color="green">
            <InkSpinner type="dots" />{" "}
          </Text>
        )}
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
