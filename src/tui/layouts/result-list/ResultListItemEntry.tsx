import React, { useEffect, useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { useErrorContext } from "../../contexts/ErrorContext";
import { useLogContext } from "../../contexts/LogContext";
import { ListEntryOptions } from "../../../constants";
import { parseDownloadUrls } from "../../../api/data/url";
import { getDocument } from "../../../api/data/document";
import { ResultListItemEntry } from "../../../api/models/ListItem";
import { useResultListContext } from "../../contexts/ResultListContext";
import { attempt } from "../../../utils";

const ResultListItemEntry: React.FC<{
  item: ResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
  isFadedOut: boolean;
}> = ({ item, isActive, isExpanded, isFadedOut }) => {
  const { throwError } = useErrorContext();
  const { pushLog } = useLogContext();

  const {
    handleSeeDetailsOptions,
    handleDownloadDirectlyOption,
    handleAddToBulkDownloadQueueOption,
    handleTurnBackToTheListOption,
    setAnyEntryExpanded,
    setActiveExpandedListLength,
  } = useResultListContext();

  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);

  const [entryOptions, setEntryOptions] = useState<Record<string, IOption>>({
    [ListEntryOptions.SEE_DETAILS.id]: {
      label: ListEntryOptions.SEE_DETAILS.label,
      onSelect: () => handleSeeDetailsOptions(item.data),
    },
    [ListEntryOptions.DOWNLOAD_DIRECTLY.id]: {
      label: ListEntryOptions.DOWNLOAD_DIRECTLY.label,
      onSelect: handleDownloadDirectlyOption,
    },
    [ListEntryOptions.ALTERNATIVE_DOWNLOADS.id]: {
      label: ListEntryOptions.ALTERNATIVE_DOWNLOADS.label,
      loading: true,
      onSelect: () => undefined,
    },
    [ListEntryOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.id]: {
      label: ListEntryOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.label,
      onSelect: handleAddToBulkDownloadQueueOption,
    },
    [ListEntryOptions.TURN_BACK_TO_THE_LIST.id]: {
      label: ListEntryOptions.TURN_BACK_TO_THE_LIST.label,
      onSelect: handleTurnBackToTheListOption,
    },
  });

  const [alternativeDownloadOptions, setAlternativeDownloadOptions] = useState<
    Record<string, IOption>
  >({});

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

    if (!isExpanded || Object.keys(alternativeDownloadOptions).length > 0) {
      return;
    }

    const fetchDownloadUrls = async () => {
      const pageDocument = await attempt(() => getDocument(item.data.mirror), pushLog, throwError);

      if (!pageDocument || !isMounted) {
        return;
      }

      const parsedDownloadUrls = parseDownloadUrls(pageDocument, throwError);

      if (!parsedDownloadUrls) {
        return;
      }

      setEntryOptions((prev) => ({
        ...prev,
        [ListEntryOptions.ALTERNATIVE_DOWNLOADS.id]: {
          ...prev[ListEntryOptions.ALTERNATIVE_DOWNLOADS.id],
          label: `${ListEntryOptions.ALTERNATIVE_DOWNLOADS.label} (${parsedDownloadUrls.length})`,
          loading: false,
          onSelect: () => {
            setActiveExpandedListLength(parsedDownloadUrls.length + 1);
            setShowAlternativeDownloads(true);
          },
        },
      }));

      setAlternativeDownloadOptions({
        ...parsedDownloadUrls.reduce<Record<string, IOption>>((prev, current, idx) => {
          return {
            ...prev,
            [idx]: {
              label: `(Mirror ${idx + 1}) ${current}`,
              onSelect: () => undefined,
            },
          };
        }, {}),
        [ListEntryOptions.BACK_TO_ENTRY_OPTIONS.id]: {
          label: ListEntryOptions.BACK_TO_ENTRY_OPTIONS.label,
          onSelect: () => {
            setShowAlternativeDownloads(false);
            setActiveExpandedListLength(Object.keys(entryOptions).length);
          },
        },
      });
    };

    fetchDownloadUrls();

    return () => {
      isMounted = false;
    };
  }, [
    isExpanded,
    item.data.mirror,
    pushLog,
    throwError,
    setActiveExpandedListLength,
    entryOptions,
    alternativeDownloadOptions,
  ]);

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "cyanBright" : ""}
        bold={isActive}
      >
        {isActive && !isExpanded && figures.pointer} [{item.order}]{" "}
        <Text color="green" bold={true}>
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
