import React from "react";
import { Box, Text } from "ink";
import { useBoundStore } from "../../store/index.js";
import { IOption } from "../../components/Option.js";
import OptionList from "../../components/OptionList.js";
import { BeforeExitOption } from "../../../options.js";
import Label from "../../../labels.js";
import { LAYOUT_KEY } from "../keys.js";

export function DownloadQueueBeforeExit() {
  const handleExit = useBoundStore((state) => state.handleExit);
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);

  const options: Record<string, IOption> = {
    [BeforeExitOption.NO]: {
      label: Label.NO,
      onSelect: () => {
        setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
      },
      order: 1,
    },
    [BeforeExitOption.YES]: {
      label: Label.YES,
      onSelect: () => handleExit(),
      order: 2,
    },
  };

  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        <Text wrap="truncate-end">You have one or more entries in your download queue.</Text>
        <Text wrap="truncate-end">Are you sure you want to exit?</Text>
      </Box>

      <OptionList options={options} />
    </Box>
  );
}
