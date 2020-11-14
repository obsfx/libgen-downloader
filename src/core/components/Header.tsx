import React from 'react';
import { Box, Text } from 'ink';
import useStore from '../../store-provider';

const Header = () => {
  const version: string = useStore(state => state.version);
  const appWidth: number = useStore(state => state.appWidth);

  return (
    <Box flexDirection='column'>
      <Box paddingRight={4} width={appWidth}>
        <Text wrap='truncate'>
          <Text>┌ </Text> 
          <Text color='yellowBright' bold>libgen-downloader </Text>
          <Text>@{version}</Text>
        </Text>
      </Box>

      <Box paddingRight={4} width={appWidth}>
        <Text wrap='truncate'>
          <Text>├─── </Text>
          <Text>Source Code: https://github.com/obsfx/libgen-downloader</Text>
        </Text>
      </Box>

      <Box paddingRight={4} width={appWidth}>
        <Text wrap='truncate'>
          <Text>└─── </Text>
          <Text>NPM Page: https://www.npmjs.com/package/libgen-downloader</Text>
        </Text>
      </Box>
    </Box>
  );
}

export default Header;
