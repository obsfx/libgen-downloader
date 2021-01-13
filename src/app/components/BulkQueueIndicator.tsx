import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../../store-provider';

const BulkQueueIndicator = () => {
  const bulkQueue: string[] = useStore(state => state.globals.bulkQueue);

  return (
    <Box>
      <Text wrap='truncate'>
        <Text>Files in bulk queue </Text>
        <Text bold={true} color='greenBright'>{bulkQueue.length} </Text>
        <Text>items</Text>
      </Text>
    </Box>
  )
}

export default BulkQueueIndicator;
