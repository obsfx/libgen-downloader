import type { ComponentProps } from "react";
import { Box, Text } from "ink";
import figures from "figures";
import Spinner from "./spinner";

export interface IOption {
  label: string;
  description?: string;
  onSelect: () => void;
  loading?: boolean;
  order?: number;
}

const Option = ({
  isOptionActive,
  option,
  ...rest
}: {
  isOptionActive: boolean;
  option: IOption;
} & ComponentProps<typeof Box>) => {
  let pointerColor = "";
  if (isOptionActive) {
    pointerColor = "yellow";
  }

  let pointer = " ";
  if (isOptionActive) {
    pointer = figures.pointer;
  }

  let labelColor = "";
  if (option.loading) {
    labelColor = "gray";
  } else if (isOptionActive) {
    labelColor = "yellow";
  }

  return (
    <Box {...rest}>
      <Box paddingRight={1}>
        <Text color={pointerColor} bold={isOptionActive}>
          {pointer}
        </Text>
      </Box>

      {option.loading && (
        <Box paddingRight={1}>
          <Spinner />
        </Box>
      )}

      <Box>
        <Text wrap="truncate" color={labelColor} bold={isOptionActive}>
          {option.label}
        </Text>
        {option.description && (
          <Text wrap="truncate" color="gray">
            {" "}
            {option.description}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Option;
