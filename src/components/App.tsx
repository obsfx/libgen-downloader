import React, { useState } from 'react';
import { Box, Text, Newline } from 'ink';
import Header from './Header';
import TextInput from 'ink-text-input';

type appProps = {
  version: string
}

const App = (props: appProps) => {
  const [ text, setText ] = useState('');

  return (
    <Box width={60} flexDirection='column'>
      <Header version={props.version} />
      <Text wrap='truncate'>
        <Text>? Search: </Text>
        <TextInput value={text} onChange={setText} />
      </Text>
      <Text>{text}</Text>
    </Box>
  );
}

export default App;
