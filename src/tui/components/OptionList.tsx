import React from "react";
import { Box } from "ink";
import Option, { IOption } from "./Option.js";
import { useListControls } from "../hooks/useListControls.js";

const OptionList: React.FC<{
  options: Record<string, IOption>;
}> = ({ options }) => {
  const { selectedOptionIndex } = useListControls(Object.values(options), (item) => {
    if (!item.loading) {
      item.onSelect();
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
