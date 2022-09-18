import React, { useCallback, useEffect, useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { createOptionItem } from "../../../utils";
import { ListEntryOptions } from "../../../constants";
import { ResultListItemEntry, ResultListItemOption } from "../../../api/models/ListItem";
import { useResultListContext } from "../../contexts/ResultListContext";

const ResultListItemEntryOptions: React.FC = () => {
  const {
    handleSeeDetailsOptions,
    handleDownloadDirectlyOption,
    handleAddToBulkDownloadQueueOption,
    handleTurnBackToTheListOption,
  } = useResultListContext();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const entryOptions = [
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

  useInput((input: string, key: Key) => {
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
  });

  return (
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
  );
};

export default ResultListItemEntryOptions;
