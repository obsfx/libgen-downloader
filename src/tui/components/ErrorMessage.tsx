import React from "react";
import { Box, Text } from "ink";
import { useAtom } from "jotai";
import { errorMessageAtom } from "../store/app";
import OptionList from "./OptionList";

export function ErrorMessage() {
  const [errorMessage, setErrorMessage] = useAtom(errorMessageAtom);

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
