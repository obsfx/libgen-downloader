import { Box, Text } from "ink";
import { useBoundStore } from "../../store";
import { IOption } from "../../components/option";
import OptionList from "../../components/option-list";
import { BeforeExitOption } from "../../../options";
import { Label } from "../../../labels";
import { LAYOUT_KEY } from "../keys";

export function DownloadQueueBeforeExit() {
  const handleExit = useBoundStore((state) => state.handleExit);
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);

  const options = {
    [BeforeExitOption.NO]: {
      label: Label.NO,
      onSelect: () => {
        setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
      },
      order: 1,
    },
    [BeforeExitOption.YES]: {
      label: Label.YES,
      onSelect: () => {
        return handleExit();
      },
      order: 2,
    },
  } satisfies Record<string, IOption>;

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
