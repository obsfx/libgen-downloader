import React from 'react';
import { Box } from 'ink';
import figures from 'figures';
import TabButton from './TabButton';

const Options = () => (
  <Box paddingX={2} flexDirection='column' width='100%'>
    <Box marginBottom={1}>
      <TabButton text={`${figures.arrowRight} Next Page`} data='nextPage' onSelect={(data: string) => {}}/>
      <TabButton disabled={true} text={`${figures.arrowLeft} Previous Page`} data='prevPage' onSelect={(data: string) => {}}/>
      <TabButton text={`${figures.line} Start Bulk Downloading`} data='nextPage' onSelect={(data: string) => {}}/>
    </Box>
    <Box>
      <TabButton text={`? Search`} data='prevPage' onSelect={(data: string) => {}}/>
      <TabButton disabled={true} text={`${figures.cross} Exit`} data='nextPage' onSelect={(data: string) => {}}/>
    </Box>
  </Box>
)

export default Options;
