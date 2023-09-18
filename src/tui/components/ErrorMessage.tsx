import React from "react";
import { Box, Text } from "ink";
import OptionList from "./OptionList";
import { useBoundStore } from "../store";

export function ErrorMessage() {
  const errorMessage = useBoundStore((state) => state.errorMessage);
  const setErrorMessage = useBoundStore((state) => state.setErrorMessage);

  return (
    <Box>
      <Box>
        <Text>
          Something went wrong:
          <Text> {errorMessage}</Text>
        </Text>
      </Box>

      <OptionList
        options={{
          ["Clear Error"]: {
            label: "Clear Error",
            onSelect: () => setErrorMessage(""),
          },
        }}
      />
    </Box>
  );
}
