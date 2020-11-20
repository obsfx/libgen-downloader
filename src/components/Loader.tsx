import React from 'react';
import { useStore, AppStatus } from '../store-provider';
import Spinner from './Spinner';

const Loader = () => {
  const LoaderMessages: Map<AppStatus, string> = new Map([
    [ 'fetchingConfig', 'Fetching Configuration File' ],
    [ 'findingMirror', 'Finding An Available Mirror' ],
    [ 'gettingResults', 'Getting Results' ]
  ]);
  const status: AppStatus = useStore(state => state.globals.status);

  return (
    <>
    { LoaderMessages.has(status) && <Spinner text={LoaderMessages.get(status) || ''} /> }
    </>
  )
}

export default Loader;
