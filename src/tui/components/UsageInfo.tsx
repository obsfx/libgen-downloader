import React from "react";
import { Box, Text } from "ink";

const UsageInfo: React.FC<{
  truncate?: boolean;
}> = ({ truncate }) => {
  return (
    <Box>
      <Text wrap={truncate ? "truncate" : undefined}>
        <Text color="yellow">[UP]</Text> and <Text color="yellow">[DOWN]</Text> arrow keys to reveal
        listings, <Text color="yellow">[ENTER]</Text> to interact
      </Text>
    </Box>
  );
};

export default UsageInfo;
