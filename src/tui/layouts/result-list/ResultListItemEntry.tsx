import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { ResultListItemEntry, ResultListItemOption } from "../../../api/models/ListItem";
import { attempt, createOptionItem } from "../../../utils";
import { ListEntryOptions } from "../../../constants";
import { useErrorContext } from "../../contexts/ErrorContext";
import { useLogContext } from "../../contexts/LogContext";
import { getDocument } from "../../../api/data/document";
import { parseDownloadUrls } from "../../../api/data/url";

const ResultListItemEntry: React.FC<{
  item: ResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
  isFadedOut: boolean;
  setExpand: (state: boolean) => void;
}> = ({ item, isActive, isExpanded, isFadedOut, setExpand }) => {
  const { throwError } = useErrorContext();
  const { pushLog } = useLogContext();

  useInput(
    (_, key: Key) => {
      if (key.return) {
        setExpand(true);
      }
    },
    { isActive: isActive && !isExpanded }
  );

  const handleSeeDetailsOptions = useCallback(() => {
    return undefined;
  }, []);

  const handleDownloadDirectlyOption = useCallback(() => {
    return undefined;
  }, []);

  const handleAddToBulkDownloadQueueOption = useCallback(() => {
    return undefined;
  }, []);

  const handleTurnBackToTheListOption = useCallback(() => {
    setExpand(false);
  }, [setExpand]);

  const entryOptions = useMemo<ResultListItemOption[]>(() => {
    return [
      createOptionItem(
        ListEntryOptions.SEE_DETAILS.id,
        ListEntryOptions.SEE_DETAILS.label,
        handleSeeDetailsOptions
      ),
      createOptionItem(
        ListEntryOptions.DOWNLOAD_DIRECTLY.id,
        ListEntryOptions.DOWNLOAD_DIRECTLY.label,
        handleDownloadDirectlyOption
      ),
      createOptionItem(
        ListEntryOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.id,
        ListEntryOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.label,
        handleAddToBulkDownloadQueueOption
      ),
      createOptionItem(
        ListEntryOptions.TURN_BACK_TO_THE_LIST.id,
        ListEntryOptions.TURN_BACK_TO_THE_LIST.label,
        handleTurnBackToTheListOption
      ),
    ] as ResultListItemOption[];
  }, [
    handleSeeDetailsOptions,
    handleDownloadDirectlyOption,
    handleAddToBulkDownloadQueueOption,
    handleTurnBackToTheListOption,
  ]);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useInput(
    (input: string, key: Key) => {
      if (input.toLowerCase() === "j" || key.downArrow) {
        const nextIndex =
          selectedOptionIndex === entryOptions.length - 1 ? 0 : selectedOptionIndex + 1;
        setSelectedOptionIndex(nextIndex);
        return;
      }

      if (input.toLowerCase() === "k" || key.upArrow) {
        const nextIndex =
          selectedOptionIndex === 0 ? entryOptions.length - 1 : selectedOptionIndex - 1;
        setSelectedOptionIndex(nextIndex);
        return;
      }

      if (key.return) {
        entryOptions[selectedOptionIndex].data.onSelect();
      }
    },
    { isActive: isExpanded }
  );

  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }
    const fetchDownloadUrls = async () => {
      const pageDocument = await attempt(() => getDocument(item.data.mirror), pushLog, throwError);

      if (!pageDocument) {
        return;
      }

      const parsedDownloadUrls = parseDownloadUrls(pageDocument, throwError);

      if (parsedDownloadUrls) {
        setDownloadUrls(parsedDownloadUrls);
      }
    };

    fetchDownloadUrls();
  }, [isExpanded, item.data.mirror, pushLog, throwError]);

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "yellow" : ""}
        bold={isActive}
      >
        {isActive && !isExpanded && figures.pointer} [{item.order}] [{item.data.extension}]{" "}
        {item.data.title}
      </Text>

      {isExpanded && (
        <Box flexDirection="column" paddingLeft={3}>
          {entryOptions.map((option, idx) => {
            const isOptionActive = idx === selectedOptionIndex;

            return (
              <Text
                key={idx}
                wrap="truncate"
                color={isOptionActive ? "yellow" : ""}
                bold={isOptionActive}
              >
                {isOptionActive && figures.pointer} {option.data.label}
              </Text>
            );
          })}
        </Box>
      )}

      {isExpanded &&
        downloadUrls.map((url, idx) => (
          <Text key={idx} wrap="truncate">
            {url}
          </Text>
        ))}
    </Box>
  );
};

export default ResultListItemEntry;
