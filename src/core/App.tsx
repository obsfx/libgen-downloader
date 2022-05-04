import React, { useEffect, useState } from 'react';
import { Text } from 'ink';

import SpinnerText from './components/SpinnerText';
import Layouts from './layouts';
import { Config, fetchConfig, findMirror } from '../api/config';
import { AppContextProvider } from './AppContext';
import { FETCHING_CONFIG, FINDING_MIRROR } from '../constants/messages';

const App: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [mirror, setMirror] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');

  useEffect(() => {
    const initializeConfig = async () => {
      // Fetch configuration from the github
      setLoaderMessage(FETCHING_CONFIG);
      setLoading(true);

      const config = await fetchConfig((failCount) => {
        //TODO: Update loading text
        console.log(`Failed: ${failCount}`);
      });
      // TODO: Remove log
      console.log(config);

      if (!config) {
        // TODO: Change layout to Error Layout
        setLoading(false);
        return;
      }

      setConfig(config);

      // Find an available mirror
      setLoaderMessage(FINDING_MIRROR);
      const mirror = await findMirror(config.mirrors);
      // TODO: Remove log
      console.log(mirror);

      setLoading(false);

      if (!mirror) {
        // TODO: Change layout to Error Layout
        return;
      }

      setMirror(mirror);
    };

    initializeConfig();
  }, []);

  if (loading) {
    return (
      <SpinnerText>
        <Text>{loaderMessage}</Text>
      </SpinnerText>
    );
  }

  if (!config || !mirror) {
    // TODO: Change layout to Error Layout
    return null;
  }

  return (
    <AppContextProvider config={config} mirror={mirror}>
      <Layouts />
    </AppContextProvider>
  );
};

export default App;
