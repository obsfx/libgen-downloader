import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import { useStore } from '../store-provider';
import { clearTerminal } from '../utils';
import Header from './Header';
import Search from './Search';

const App = () => {
  const [ cols ] = useStdoutDimensions();

  const maxWidth: number = useStore(state => state.constants.baseAppWidth);
  const appWidth: number | null = useStore(state => state.globals.appWidth);
  const setAppWidth: (appWidth: number) => void = useStore(state => state.set.appWidth);

  const adjustSize = () => {
    clearTerminal();
    setAppWidth(Math.min(maxWidth, cols));
  }

  useEffect(() => {
    if (appWidth == 0 || cols < maxWidth || appWidth < maxWidth) {
      adjustSize();
    }
  }, [cols]);

  return (
    <Box 
      width={appWidth} 
      flexDirection='column' 
      borderStyle='single'>
      <Header />
      <Search />
      <Text>{useStore(state => state.globals.query)}</Text>
    </Box>
  );
}

export default App;
