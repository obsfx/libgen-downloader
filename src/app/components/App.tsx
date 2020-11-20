import React, { useEffect } from 'react';
import { Box, useStdin } from 'ink';
import { Response } from 'node-fetch';
import { config_endpoint, base_app_width, error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { useStore, Config, AppStatus } from '../../store-provider';
import { doRequest, findMirror } from '../../search-api';
import Loader from './Loader';
import Header from './Header';
import Stage from './Stage';

type Props = {
  appWidth: number;
}

const App = (props: Props) => {
  const { setRawMode } = useStdin();

  const appWidth: number = props.appWidth > base_app_width ? 
    base_app_width : 
    props.appWidth;

  const config: Config | null = useStore(state => state.config);
  const setConfig: (config: Config) => void = useStore(state => state.set.config);
  const setMirror: (mirror: string) => void = useStore(state => state.set.mirror);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  useEffect(() => {
    if (config == null) {
      const setupTheApp = async () => {
        // fetching latest configuration
        setStatus('fetchingConfig');
        const configResponse: Response | null = await doRequest(config_endpoint, () => {}, error_tolarance, error_reconnect_delay_ms);
        if (configResponse == null) {
          // throw error here
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
          return;
        }

        setMirror(mirror);
        setStatus('search');
      }

      setRawMode(true);
      setupTheApp();

      () => setRawMode(false);
    }
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
