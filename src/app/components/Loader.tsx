import React from 'react';
import { Box, Text } from 'ink';
import { useStore, AppStatus } from '../../store-provider';
import { error_tolarance } from '../app-config.json';
import Spinner from './Spinner';

const Loader = () => {
  const LoaderMessages: Map<AppStatus, string> = new Map([
    [ 'fetchingConfig', 'Fetching Configuration File' ],
    [ 'findingMirror', 'Finding An Available Mirror' ],
    [ 'gettingResults', 'Getting Results' ]
  ]);

  const status: AppStatus = useStore(state => state.globals.status);
  const errorCounter: number = useStore(state => state.globals.errorCounter);

  return (
    <>
      { 
        LoaderMessages.has(status) && 
        <Spinner>
          <Box flexDirection='column'>
            {
              errorCounter > 0 &&
              <Text>
                <Text color='red'>{errorCounter} / {error_tolarance}</Text>
                &nbsp;
                <Text bold={true} color='yellowBright'>Request Failed. Trying Again</Text>
              </Text>
            }

            <Text>
              { LoaderMessages.get(status) || '' }
            </Text>
          </Box>
        </Spinner> 
      }
    </>
  )
}

export default Loader;
