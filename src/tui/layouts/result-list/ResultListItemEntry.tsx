import React, { useCallback, useMemo, useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { ResultListItemEntry, ResultListItemOption } from "../../../api/models/ListItem";
import { createOptionItem } from "../../../utils";
import {
  OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_ID,
  OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_LABEL,
  OPTION_DOWNLOAD_DIRECTLY_ID,
  OPTION_DOWNLOAD_DIRECTLY_LABEL,
  OPTION_SEE_DETAILS_ID,
  OPTION_SEE_DETAILS_LABEL,
  OPTION_TURN_BACK_TO_THE_LIST_ID,
  OPTION_TURN_BACK_TO_THE_LIST_LABEL,
} from "../../../constants";

const ResultListItemEntry: React.FC<{
  item: ResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
  isFadedOut: boolean;
  setExpand: (state: boolean) => void;
}> = ({ item, isActive, isExpanded, isFadedOut, setExpand }) => {
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
      createOptionItem(OPTION_SEE_DETAILS_ID, OPTION_SEE_DETAILS_LABEL, handleSeeDetailsOptions),
      createOptionItem(
        OPTION_DOWNLOAD_DIRECTLY_ID,
        OPTION_DOWNLOAD_DIRECTLY_LABEL,
        handleDownloadDirectlyOption
      ),
      createOptionItem(
        OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_ID,
        OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_LABEL,
        handleAddToBulkDownloadQueueOption
      ),
      createOptionItem(
        OPTION_TURN_BACK_TO_THE_LIST_ID,
        OPTION_TURN_BACK_TO_THE_LIST_LABEL,
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

  return (
    <Box flexDirection="column">
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "yellow" : ""}
        bold={isActive}
      >
        {isActive && figures.pointer} [{item.order}] [{item.data.extension}] {item.data.title}
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
    </Box>
  );
};

export default ResultListItemEntry;
