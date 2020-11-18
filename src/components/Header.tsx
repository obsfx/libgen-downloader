import React from 'react';
import { Box, Text } from 'ink';
import { version } from '../../package.json';
import { useStore } from '../store-provider';

const Header = () => {
  const appWidth: number | null = useStore(state => state.globals.appWidth);

  return (
    <Box flexDirection='column' marginBottom={1}>
      <Box paddingRight={4} width={appWidth}>
        <Text wrap='truncate'>
          ┌ 
          <Text color='yellowBright' bold>libgen-downloader </Text>
          @{version}
        </Text>
      </Box>

      <Box paddingRight={4} width={appWidth}>
        <Text wrap='truncate'>
          ├─── Source Code: https://github.com/obsfx/libgen-downloader
        </Text>
      </Box>

      <Box paddingRight={4} width={appWidth}>
        <Text wrap='truncate'>
          └─── NPM Page: https://www.npmjs.com/package/libgen-downloader
        </Text>
      </Box>
    </Box>
  );
}

export default Header;
