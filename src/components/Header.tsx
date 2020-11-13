import React from 'react';
import { Text, Newline } from 'ink';

type headerProps = {
  version: string
}

const Header = (props: headerProps) => {
  return (
    <Text>
      <Text wrap='truncate'>
        <Text>┌ </Text> 
        <Text color='yellowBright' bold>libgen-downloader </Text>
        <Text>@{props.version}</Text>
      </Text>
      <Newline />

      <Text wrap='truncate'>
        <Text>├─── </Text>
        <Text>Source Code: https://github.com/obsfx/libgen-downloader</Text>
      </Text>
      <Newline />

      <Text wrap='truncate'>
        <Text>└─── </Text>
        <Text>NPM Page: https://www.npmjs.com/package/libgen-downloader</Text>
      </Text>
      <Newline />
    </Text>
  )
}

export default Header;
