import React from "react";
import { Box, Text, useApp } from "ink";
import OptionList from "./OptionList.js";
import { useBoundStore } from "../store/index.js";
import Label from "../../labels.js";

export function ErrorMessage() {
  const { exit } = useApp();
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
              exit();
              process.exit(0);
            },
          },
        }}
      />
    </Box>
  );
}
