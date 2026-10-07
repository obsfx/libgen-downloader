import { useEffect, useState } from "react";
import { appServices } from "../../api/services/shared-services";

const TICK_MS = 1000;

export const useNow = (active: boolean): number => {
  const [, setTicks] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = setInterval(() => setTicks((ticks) => ticks + 1), TICK_MS);
    return () => clearInterval(timer);
  }, [active]);

  return appServices().clock.now();
};
