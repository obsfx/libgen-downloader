import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../../store-provider';
import { Entry } from '../../search-api';

const EntryDetails = () => {
  const entryBuffer: Entry | null = useStore(state => state.globals.entryBuffer);
  const labels: string[] = [
    'ID',
    'Author',
    'Title',
    'Publisher',
    'Year',
    'Pages',
    'Language',
    'Size',
    'Extension',
    'Mirror'
  ];

  return (
    <Box 
      paddingLeft={1}
      borderStyle='single' 
      borderColor='grey'>
    {
      entryBuffer &&
      <Box flexDirection='column'>
      {
        Object.values(entryBuffer).map((value: string, i: number) => (
          <Box key={i}>
            <Text color='yellowBright' bold={true}>{labels[i]}:&nbsp;&nbsp;</Text>
            <Text>{value}</Text>
          </Box>
        ))
      }
      </Box>
    }
    </Box>
  )
};

export default EntryDetails;
