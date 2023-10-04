import React from "react";
import { Box, Text } from "ink";
import figures from "figures";
import Spinner from "./Spinner";

export interface IOption {
  label: string;
  description?: string;
  onSelect: () => void;
  loading?: boolean;
  order?: number;
}

const Option: React.FC<
  {
    isOptionActive: boolean;
    option: IOption;
  } & React.ComponentProps<typeof Box>
> = ({ isOptionActive, option, ...rest }) => {
  return (
    <Box {...rest}>
      <Box paddingRight={1}>
        <Text color={isOptionActive ? "yellow" : ""} bold={isOptionActive}>
          {isOptionActive ? figures.pointer : " "}
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
        {option.description ? (
          <Text wrap="truncate" color="gray">
            {" "}
            {option.description}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export default Option;
