import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../../store-provider';

const Downloader = () => {
  const downloadQueue: string[] = useStore(state => state.globals.downloadQueue);

  return (
    <Box>
      {
        downloadQueue.length > 0 &&
        <Text>Downloading: {downloadQueue.length}</Text>
      }
    </Box>
  )
}

export default Downloader;
