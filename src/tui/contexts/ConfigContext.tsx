import React, { useContext, useEffect, useMemo, useState } from "react";

import { Config, fetchConfig, findMirror } from "../../api/config";
import { useLoaderContext } from "./LoaderContext";
import {
  COULDNT_REACH_TO_CONF,
  COULDNT_REACH_TO_MIRROR,
  FETCHING_CONFIG,
  FINDING_MIRROR,
} from "../../constants/messages";
import { useErrorContext } from "./ErrorContext";
import { attempt } from "../../utils";
import { useLogContext } from "./LogContext";

export interface IConfigContext {
  config: Config;
  mirror: string;
}

export const ConfigContext = React.createContext<IConfigContext | undefined>(undefined);

export const useConfigContext = () => {
  return useContext(ConfigContext) as IConfigContext;
};

export const ConfigContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { throwError } = useErrorContext();
  const { pushLog } = useLogContext();
  const { setIsLoading, setLoaderMessage } = useLoaderContext();

  const [config, setConfig] = useState<Config>({
    latestVersion: "",
    mirrors: [],
    searchReqPattern: "",
    searchByMD5Pattern: "",
    MD5ReqPattern: "",
  });
  const [mirror, setMirror] = useState<string>("");

  useEffect(() => {
    const initializeConfig = async () => {
      // Fetch configuration from the github
      setLoaderMessage(FETCHING_CONFIG);
      setIsLoading(true);

      const config = await attempt(fetchConfig, pushLog, throwError);

      if (!config) {
        return;
      }

      setConfig(config);

      // Find an available mirror
      setLoaderMessage(FINDING_MIRROR);
      const mirror = await findMirror(config.mirrors, (failedMirror: string) => {
        setLoaderMessage(`${COULDNT_REACH_TO_MIRROR}, ${failedMirror}. ${FINDING_MIRROR}`);
      });

      if (!mirror) {
        setIsLoading(false);
        throwError("Couldn't find an available libgen mirror.");
        return;
      }

      setMirror(mirror);
      setIsLoading(false);
    };

    initializeConfig();
  }, [setIsLoading, setLoaderMessage, throwError]);

  const state = useMemo<IConfigContext>(
    () => ({
      config,
      mirror,
    }),
    [config, mirror]
  );

  return <ConfigContext.Provider value={state}>{children}</ConfigContext.Provider>;
};
