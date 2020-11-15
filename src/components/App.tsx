import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store-provider';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import { clearTerminal } from '../utils';
import Header from './Header';
import Search from './Search';

const App = () => {
  const [ cols ] = useStdoutDimensions();

  const maxWidth: number = 75;
  const appWidth: number = useStore(state => state.appWidth);
  const setAppWidth: (appWidth: number) => void = useStore(state => state.setAppWidth);

  const adjustSize = () => {
    //clearTerminal();
    //setAppWidth(Math.min(maxWidth, cols));
  }

  useEffect(() => {
    adjustSize();
  }, []);

  useEffect(() => {
    if (cols < maxWidth || appWidth < maxWidth) {
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
      <Text>{useStore(state => state.query)}</Text>
    </Box>
  );
}

export default App;
