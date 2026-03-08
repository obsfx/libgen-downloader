import { Box } from "ink";
import Option, { IOption } from "./option";
import { useListControls } from "../hooks/use-list-controls";

const OptionList = ({ options }: { options: Record<string, IOption> }) => {
  // eslint-disable-next-line unicorn/no-array-sort
  const sortedEntries = [...Object.entries(options)].sort(
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
      {sortedEntries.map(([key, option], index) => {
        const isOptionActive = index === selectedOptionIndex;
        return <Option key={key} isOptionActive={isOptionActive} option={option} />;
      })}
    </Box>
  );
};

export default OptionList;
