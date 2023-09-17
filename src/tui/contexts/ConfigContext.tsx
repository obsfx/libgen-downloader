import React, { useContext, useEffect, useState } from "react";

import { Config } from "../../api/data/config";
import { useConfig } from "../hooks/useConfig";

export interface IConfigContext {}

export const ConfigContext = React.createContext<IConfigContext | null>(null);

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfigContext must be used within a ConfigContextProvider");
  }
  return context;
};

export const ConfigContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //const { getConfig } = useConfig();

  //const [config, setConfig] = useState<Config>({
  //  latestVersion: "",
  //  mirrors: [],
  //  searchReqPattern: "",
  //  searchByMD5Pattern: "",
  //  MD5ReqPattern: "",
  //});
  //const [mirror, setMirror] = useState<string>("");

  //useEffect(() => {
  //  const initializeConfig = async () => {
  //    const { config, mirror } = await getConfig();

  //    if (config && mirror) {
  //      setConfig(config);
  //      setMirror(mirror);
  //    }
  //  };

  //  initializeConfig();
  //}, [getConfig]);

  return <ConfigContext.Provider value={{}}>{children}</ConfigContext.Provider>;
};
