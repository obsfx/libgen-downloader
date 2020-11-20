import React from 'react';
import { Box, Text } from 'ink';
import { version } from '../../../package.json';

type Props = {
  appWidth: number;
}

const Header = (props: Props) => {
  const { appWidth } = props;

  return (
    <Box flexDirection='column' marginBottom={1}>
      <Box borderColor='gray' borderStyle='round' width={Math.min(30, appWidth)} justifyContent='center'>
        <Text wrap='truncate'>
          <Text color='yellowBright' bold>libgen-downloader </Text>
          <Text>@{version}</Text>
        </Text>
      </Box>

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
