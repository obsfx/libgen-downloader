import React from "react";
import { Box } from "ink";
import { SCREEN_BASE_APP_WIDTH, SCREEN_PADDING, SCREEN_WIDTH_PERC } from "../../settings.js";
import { useStdoutDimensions } from "../hooks/useStdoutDimensions.js";

interface Props {
  children: React.ReactNode;
}

export function AppContainer({ children }: Props) {
  const [cols] = useStdoutDimensions();

  const width =
    cols - SCREEN_PADDING > SCREEN_BASE_APP_WIDTH ? SCREEN_BASE_APP_WIDTH : `${SCREEN_WIDTH_PERC}%`;

  return (
    <Box width={width} marginLeft={1} paddingRight={4} flexDirection="column">
      {children}
    </Box>
  );
}
