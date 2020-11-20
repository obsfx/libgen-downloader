import React from 'react';
import { Box } from 'ink';
import { useStore, AppStatus } from '../../store-provider';
import Search from './Search';
import Results from './Results';
import EntryDetails from './EntryDetails';

const Stage = () => {
  const status: AppStatus = useStore(state => state.globals.status);

  return (
    <Box>
      { status == 'search' && <Search /> }
      { status == 'results' && <Results /> }
      { status == 'entryDetails' && <EntryDetails /> }
    </Box>
  )
};

export default Stage;
