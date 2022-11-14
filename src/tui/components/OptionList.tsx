import React, { useState } from "react";
import { Box, useInput, Key } from "ink";
import Option, { IOption } from "./Option";

const OptionList: React.FC<{
  options: Record<string, IOption>;
}> = ({ options }) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useInput((input: string, key: Key) => {
    const optionValues = Object.values(options);

    if (input.toLowerCase() === "j" || key.downArrow) {
      const nextIndex =
        selectedOptionIndex === optionValues.length - 1 ? 0 : selectedOptionIndex + 1;
      setSelectedOptionIndex(nextIndex);
      return;
    }

    if (input.toLowerCase() === "k" || key.upArrow) {
      const nextIndex =
        selectedOptionIndex === 0 ? optionValues.length - 1 : selectedOptionIndex - 1;
      setSelectedOptionIndex(nextIndex);
      return;
    }

    if (key.return) {
      optionValues[selectedOptionIndex].onSelect();
    }
  });

  return (
    <Box flexDirection="column" paddingLeft={3}>
      {Object.entries(options).map(([key, option], idx) => {
        const isOptionActive = idx === selectedOptionIndex;
        return <Option key={key} isOptionActive={isOptionActive} option={option} />;
      })}
    </Box>
  );
};

export default OptionList;
