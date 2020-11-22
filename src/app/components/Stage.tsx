import React from 'react';
import { Box } from 'ink';
import { useStore, AppStatus } from '../../store-provider';
import Search from './Search';
import GettingResults from './GettingResults';
import Results from './Results';
import EntryDetails from './EntryDetails';
import ErrorBox from './ErrorBox';

const Stage = () => {
  const status: AppStatus = useStore(state => state.globals.status);

  return (
    <Box>
      { status == 'search' && <Search /> }
      { status == 'gettingResults' && <GettingResults /> }
      { status == 'results' && <Results /> }
      { status == 'entryDetails' && <EntryDetails /> }
      { status == 'failed' && <ErrorBox /> }
    </Box>
  )
};

export default Stage;
