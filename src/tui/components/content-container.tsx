import React from "react";
import { Box } from "ink";

const ContentContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="grey"
      width="100%"
      paddingLeft={1}
      paddingRight={1}
    >
      {children}
    </Box>
  );
};

export default ContentContainer;
