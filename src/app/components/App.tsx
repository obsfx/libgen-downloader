import React, { useEffect } from 'react';
import { Box, useStdin } from 'ink';
import { Response } from 'node-fetch';
import { config_endpoint, error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { useStore, AppStatus } from '../../store-provider';
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

  const config = useStore(state => state.config);
  const setConfig: (config: any) => void = useStore(state => state.set.config);
  const executed: boolean = useStore(state => state.globals.executed);
  const setExecuted: (executed: boolean) => void = useStore(state => state.set.executed);
  const setConfigFetched: (configFetched: boolean) => void = useStore(state => state.set.configFetched);
  const setErrorCounter: (errorCounter: number) => void = useStore(state => state.set.errorCounter);
  const seetLastFailedAction: (lastFailedAction: Function) => void = useStore(state => state.set.lastFailedAction);
  const setMirror: (mirror: string) => void = useStore(state => state.set.mirror);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  useEffect(() => {
    if (!executed) {
      const setupTheApp = async () => {
        setExecuted(true);

        const onErr = (attempt: number, _: number) => {
          setErrorCounter(attempt);
        }

        // fetching latest configuration
        setStatus('fetchingConfig');
        const configResponse: Response | null = await doRequest(config_endpoint, onErr, error_tolarance, error_reconnect_delay_ms);

        if (configResponse == null) {
          // throw error here
          seetLastFailedAction(setupTheApp);
          setStatus('failed');
          return;
        }

        const configJSON = await configResponse.json();
        setConfig(configJSON);

        // finding available mirror
        setStatus('findingMirror');

        const mirrorList: string[] = config?.mirror || [];
        const mirror: string | null = await findMirror(mirrorList);

        if (mirror == null) {
          // throw error here
          seetLastFailedAction(setupTheApp);
          setStatus('failed');
          return;
        }

        setConfigFetched(true);
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
