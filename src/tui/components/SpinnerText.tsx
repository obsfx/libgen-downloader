import React from "react";
import { Box } from "ink";
import Spinner from "./Spinner";

const SpinnerText: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <Box>
      <Box marginRight={1}>
        <Spinner />
      </Box>
      {children}
    </Box>
  );
};

export default SpinnerText;
