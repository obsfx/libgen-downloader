import React from "react";
import { Box, Text } from "ink";

const DetailRow: React.FC<{
  label: string;
  description: string;
}> = ({ label, description }) => {
  return (
    <Box>
      <Box flexShrink={0}>
        <Text color="yellow" bold={true}>
          {label}:{" "}
        </Text>
      </Box>
      <Text>{description}</Text>
    </Box>
  );
};

export default DetailRow;
