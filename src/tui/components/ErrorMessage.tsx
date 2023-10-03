import React from "react";
import { Box, Text } from "ink";
import OptionList from "./OptionList";
import { useBoundStore } from "../store/index";
import Label from "../../labels";
import { ErrorMessageOption } from "../../options";

export function ErrorMessage() {
  const errorMessage = useBoundStore((state) => state.errorMessage);
  const handleExit = useBoundStore((state) => state.handleExit);

  return (
    <Box flexDirection="column">
      <Box>
        <Text>
          Something went wrong:
          <Text> {errorMessage}</Text>
        </Text>
      </Box>

      <OptionList
        options={{
          [ErrorMessageOption.EXIT]: {
            label: Label.EXIT,
            onSelect: () => handleExit(),
          },
        }}
      />
    </Box>
  );
}
