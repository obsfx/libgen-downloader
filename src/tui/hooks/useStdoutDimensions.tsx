import { useEffect, useState } from "react";
import { useStdout } from "ink";
import { SCREEN_BASE_APP_WIDTH } from "../../settings";

// ref: https://github.com/cameronhunter/ink-monorepo/blob/master/packages/ink-use-stdout-dimensions/src/index.ts
export function useStdoutDimensions(): [number, number] {
  const { stdout } = useStdout();

  const initSize = stdout?.columns || SCREEN_BASE_APP_WIDTH;
  const [dimensions, setDimensions] = useState<[number, number]>([initSize, initSize]);

  useEffect(() => {
    if (!stdout) {
      return;
    }
    
    const handler = () => setDimensions([stdout.columns, stdout.rows]);
    stdout.on("resize", handler);
    return () => {
      stdout.off("resize", handler);
    };
  }, [stdout]);

  return dimensions;
}
