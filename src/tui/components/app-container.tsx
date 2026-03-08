import type { ReactNode } from "react";
import { Box } from "ink";
import { SCREEN_BASE_APP_WIDTH, SCREEN_PADDING, SCREEN_WIDTH_PERC } from "../../settings";
import { useStdoutDimensions } from "../hooks/use-stdout-dimensions";

interface Properties {
  children: ReactNode;
}

export function AppContainer({ children }: Properties) {
  const [cols] = useStdoutDimensions();

  let width: number | string = `${SCREEN_WIDTH_PERC}%`;
  if (cols - SCREEN_PADDING > SCREEN_BASE_APP_WIDTH) {
    width = SCREEN_BASE_APP_WIDTH;
  }

  return (
    <Box width={width} marginLeft={1} paddingRight={4} flexDirection="column">
      {children}
    </Box>
  );
}
