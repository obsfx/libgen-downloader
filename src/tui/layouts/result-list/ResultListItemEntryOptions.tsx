import React, { useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import Spinner from "../../components/Spinner";
import { EntryOption } from "./ResultListItemEntry";

const ResultListItemEntryOptions: React.FC<{ entryOptions: Record<string, EntryOption> }> = ({
  entryOptions,
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useInput((input: string, key: Key) => {
    const options = Object.values(entryOptions);

    if (input.toLowerCase() === "j" || key.downArrow) {
      const nextIndex = selectedOptionIndex === options.length - 1 ? 0 : selectedOptionIndex + 1;
      setSelectedOptionIndex(nextIndex);
      return;
    }

    if (input.toLowerCase() === "k" || key.upArrow) {
      const nextIndex = selectedOptionIndex === 0 ? options.length - 1 : selectedOptionIndex - 1;
      setSelectedOptionIndex(nextIndex);
      return;
    }

    if (key.return) {
      options[selectedOptionIndex].onSelect();
    }
  });

  return (
    <Box flexDirection="column" paddingLeft={3}>
      {Object.entries(entryOptions).map(([key, option], idx) => {
        const isOptionActive = idx === selectedOptionIndex;

        return (
          <Box key={key}>
            <Box paddingRight={1}>
              <Text color={isOptionActive ? "yellow" : ""} bold={isOptionActive}>
                {isOptionActive && figures.pointer}
              </Text>
            </Box>

            {option.loading && (
              <Box paddingRight={1}>
                <Spinner />
              </Box>
            )}

            <Box>
              <Text
                wrap="truncate"
                color={option.loading ? "gray" : isOptionActive ? "yellow" : ""}
                bold={isOptionActive}
              >
                {option.label}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ResultListItemEntryOptions;
