import type { ReactNode } from "react";
import { Box } from "ink";
import Spinner from "./spinner";

const SpinnerText = ({ children }: { children: ReactNode }) => {
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
