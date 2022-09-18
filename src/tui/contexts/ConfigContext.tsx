import React, { useContext, useEffect, useState } from "react";

import { Config } from "../../api/data/config";
import { useConfig } from "../hooks/useConfig";

export interface IConfigContext {
  config: Config;
  mirror: string;
}

export const ConfigContext = React.createContext<IConfigContext | undefined>(undefined);

export const useConfigContext = () => {
  return useContext(ConfigContext) as IConfigContext;
};

export const ConfigContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getConfig } = useConfig();

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
      const { config, mirror } = await getConfig();

      if (config && mirror) {
        setConfig(config);
        setMirror(mirror);
      }
    };

    initializeConfig();
  }, [getConfig]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        mirror,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
