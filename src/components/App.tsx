import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { Response } from 'node-fetch';
import { config_endpoint, base_app_width, error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import { useStore, Config, AppStatus } from '../store-provider';
import { clearTerminal } from '../utils';
import { doRequest, findMirror } from '../search-api';
import Spinner from './Spinner';
import Header from './Header';
import Search from './Search';

const App = () => {
  const [ cols ] = useStdoutDimensions();

  const maxWidth: number = base_app_width;
  const appWidth: number | null = useStore(state => state.globals.appWidth);
  const setAppWidth: (appWidth: number) => void = useStore(state => state.set.appWidth);

  const setConfig: (config: Config) => void = useStore(state => state.set.config);

  const mirror: string | null = useStore(state => state.globals.mirror);
  const setMirror: (mirror: string) => void = useStore(state => state.set.mirror);

  const status: AppStatus = useStore(state => state.globals.status);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  useEffect(() => {
    const setupTheApp = async () => {
      // fetching latest configuration
      setStatus('fetchConfig');
      const configResponse: Response | null = await doRequest(config_endpoint, () => {}, error_tolarance, error_reconnect_delay_ms);
      if (configResponse == null) {
        // throw error here
        return;
      }

      const configJSON = await configResponse.json();
      setConfig(configJSON);

      // finding available mirror
      setStatus('findMirror');
      const mirrorList: string[] = configJSON.mirrors || [];
      const mirror: string | null = await findMirror(mirrorList);

      if (mirror == null) {
        // throw error here
        return;
      }

      setMirror(mirror);
      setStatus('search');
    }

    setupTheApp();
  }, []);

  useEffect(() => {
    if (appWidth == 0 || cols < maxWidth || appWidth < maxWidth) {
      clearTerminal();
      setAppWidth(Math.min(maxWidth, cols));
    }
  }, [cols]);

  return (
    <Box 
      width={appWidth} 
      flexDirection='column' 
      borderStyle='single'>
      <Header />
      { status == 'fetchConfig' && <Spinner text='Fetching Latest Libgen Mirrors' /> }
      { status == 'findMirror' && <Spinner text='Finding Available Mirror' /> }
      { status == 'search' && <Search /> }
      <Text>{useStore(state => state.globals.query)}</Text>
      { mirror && <Text color='grey'>current mirror: {mirror}</Text> }
    </Box>
  );
}

export default App;
