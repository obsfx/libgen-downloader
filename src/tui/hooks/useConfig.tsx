import { useCallback } from "react";
import { useLogContext } from "../contexts/LogContext";
import Label from "../../labels";
import { attempt } from "../../utils";
import { fetchConfig, findMirror } from "../../api/data/config";
import { useAtom } from "jotai";
import { isLoadingAtom, loaderMessageAtom } from "../store/app";
import { AppEvent, EventManager } from "../classes/EventEmitterManager";

export const useConfig = () => {
  const { pushLog, clearLog } = useLogContext();
  const [, setIsLoading] = useAtom(isLoadingAtom);
  const [, setLoaderMessage] = useAtom(loaderMessageAtom);

  const getConfig = useCallback(async () => {
    // Fetch configuration from the github
    setLoaderMessage(Label.FETCHING_CONFIG);
    setIsLoading(true);

    const config = await attempt(
      async () => {
        const config = await fetchConfig();
        clearLog();
        return config;
      },
      pushLog,
      (error) => EventManager.emit(AppEvent.THROW_ERROR, error),
      clearLog
    );

    if (!config) {
      return {};
    }

    // Find an available mirror
    setLoaderMessage(Label.FINDING_MIRROR);
    const mirror = await findMirror(config.mirrors, (failedMirror: string) => {
      setLoaderMessage(
        `${Label.COULDNT_REACH_TO_MIRROR}, ${failedMirror}. ${Label.FINDING_MIRROR}`
      );
    });

    if (!mirror) {
      setIsLoading(false);
      EventManager.emit(AppEvent.THROW_ERROR, "Couldn't find an available libgen mirror.");
      return {};
    }

    setIsLoading(false);

    return { config, mirror };
  }, [pushLog, clearLog, setIsLoading, setLoaderMessage]);

  return { getConfig };
};
