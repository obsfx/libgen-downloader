import React from "react";
import { Box, Text } from "ink";
import OptionList from "./OptionList.js";
import { useBoundStore } from "../store/index.js";
import Label from "../../labels.js";

export function ErrorMessage() {
  const errorMessage = useBoundStore((state) => state.errorMessage);

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
          ["Exit"]: {
            label: Label.EXIT,
            onSelect: () => {
              process.exit(0);
            },
          },
        }}
      />
    </Box>
  );
}
