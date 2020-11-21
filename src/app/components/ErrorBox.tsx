import React from 'react';
import { Box, Text } from 'ink';
import { useStore, returnedValue, AppStatus } from '../../store-provider';
import SelectInput, { SelectInputItem } from './SelectInput';

const ErrorBox = () => {
  const lastFailedAction: Function = useStore(state => state.globals.lastFailedAction);
  const configFetched: boolean = useStore(state => state.globals.configFetched);
  const setErrorCounter: (errorCounter: number) => void = useStore(state => state.set.errorCounter);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  const selectInputItems: SelectInputItem[] = [
    {
      label: 'Try Again',
      value: returnedValue.tryAgain
    },
    {
      label: 'Search Another',
      value: returnedValue.searchAnother,
      disabled: !configFetched
    },
    {
      label: 'Exit',
      value: returnedValue.exit,
    }
  ];

  const handleOnSelect = (returned: returnedValue) => {
    switch (returned) {
      case returnedValue.tryAgain:
        setErrorCounter(0);
        lastFailedAction();
      break;

      case returnedValue.searchAnother:
      break;
    }
  }

  return (
    <Box flexDirection='column' borderStyle='single' borderColor='grey'>
      <Text color='red' wrap='truncate'>Your request has failed</Text>
      <Box width='100%'>
        <SelectInput selectInputItems={selectInputItems} onSelect={handleOnSelect} />
      </Box>
    </Box>
  )
}

export default ErrorBox;
