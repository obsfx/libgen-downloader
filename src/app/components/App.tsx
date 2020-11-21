import React, { useEffect } from 'react';
import { Box, useStdin } from 'ink';
import { Response } from 'node-fetch';
import { config_endpoint, error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { useStore, Config, AppStatus } from '../../store-provider';
import { doRequest, findMirror } from '../../search-api';
import Loader from './Loader';
import Header from './Header';
import Stage from './Stage';

type Props = {
  appWidth: number;
}

const App = (props: Props) => {
  const { appWidth } = props;

  const { setRawMode } = useStdin();

  const config: Config | null = useStore(state => state.config);
  const setConfig: (config: Config) => void = useStore(state => state.set.config);
  const configFetched: boolean = useStore(state => state.globals.configFetched);
  const setConfigFetched: (configFetched: boolean) => void = useStore(state => state.set.configFetched);
  const setMirror: (mirror: string) => void = useStore(state => state.set.mirror);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  useEffect(() => {
    if (config == null && !configFetched) {
      const setupTheApp = async () => {
        // fetching latest configuration
        setConfigFetched(true);
        setStatus('fetchingConfig');
        const configResponse: Response | null = await doRequest(config_endpoint, () => {}, error_tolarance, error_reconnect_delay_ms);

        if (configResponse == null) {
          // throw error here
          setConfigFetched(false);
          return;
        }

        const configJSON = await configResponse.json();
        setConfig(configJSON);

        // finding available mirror
        setStatus('findingMirror');
        const mirrorList: string[] = configJSON.mirrors || [];
        const mirror: string | null = await findMirror(mirrorList);

        if (mirror == null) {
          // throw error here
          setConfigFetched(false);
          return;
        }

        setMirror(mirror);
        setStatus('search');
      }

      setupTheApp();
    }

    setRawMode(true);
    () => setRawMode(false);
  }, []);

  return (
    <Box>
      <Box 
        width={appWidth} 
        flexDirection='column'>
        <Header appWidth={appWidth}/>
        <Loader />
        <Stage />
      </Box>
    </Box>
  );
}

export default App;
