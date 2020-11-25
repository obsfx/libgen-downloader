import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';
import { version } from '../../../package.json';
import { useStore } from '../../store-provider';

type Props = {
  width: number | string;
}

const Header = (props: Props) => {
  const { width } = props;

  const [ newVersionAvailable, setNewVersionAvailable ] = useState(false);

  const latestVersion: string = useStore(state => state.config?.latest_version) || '';

  useEffect(() => {
    setNewVersionAvailable(latestVersion != '' && latestVersion != version);
  }, [latestVersion]);

  return (
    <Box flexDirection='column' marginBottom={1} width='90%'>
      <Box borderColor='gray' borderStyle='round' justifyContent='center' width={width}>
        <Text wrap='truncate'>
          <Text color='yellowBright' bold>libgen-downloader </Text>
          <Text>@{version} </Text>
          { newVersionAvailable &&
            <Text>
              <Text color='greenBright'>{figures.arrowRight} @{latestVersion} </Text>
            </Text>
          }
        </Text>
      </Box>

      { newVersionAvailable && <Text color='greenBright'>new version available: npm i -g libgen-downloader</Text> }

      <Box width='100%' flexDirection='column'>
        <Text wrap='truncate'>
          <Text color='grey'>source: </Text>
          <Text>https://github.com/obsfx/libgen-downloader</Text>
        </Text>
        <Text wrap='truncate'>
          <Text wrap='truncate' color='grey'>npm: </Text>
          <Text>https://www.npmjs.com/package/libgen-downloader</Text>
        </Text>
      </Box>
    </Box>
  );
}

export default Header;
