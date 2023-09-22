import React from "react";
import { Box, Text } from "ink";
import Label from "../../../labels.js";
import InkSpinner from "ink-spinner";
import { RESULT_LIST_LENGTH } from "../../../constants.js";

export function ResultListLoadingSkeleton() {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={RESULT_LIST_LENGTH + 2}
      borderStyle="round"
      borderColor="grey"
      width="100%"
      paddingLeft={1}
      paddingRight={1}
    >
      <Text color="white">
        <InkSpinner type="simpleDotsScrolling" />
      </Text>
      <Text color="white">{Label.GETTING_RESULTS}</Text>
    </Box>
  );
}
