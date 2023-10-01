import React from "react";
import { Box } from "ink";
import Option, { IOption } from "./Option.js";
import { useListControls } from "../hooks/useListControls.js";

const OptionList: React.FC<{
  options: Record<string, IOption>;
}> = ({ options }) => {
  const sortedEntries = Object.entries(options).sort(
    ([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0)
  );

  const values = sortedEntries.map(([, option]) => option);

  const { selectedOptionIndex } = useListControls(values, (item) => {
    if (!item.loading) {
      item.onSelect();
    }
  });

  return (
    <Box flexDirection="column" paddingLeft={3}>
      {sortedEntries.map(([key, option], idx) => {
        const isOptionActive = idx === selectedOptionIndex;
        return <Option key={key} isOptionActive={isOptionActive} option={option} />;
      })}
    </Box>
  );
};

export default OptionList;
