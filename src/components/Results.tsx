import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store-provider';
import { Entry } from '../search-api';
import List from './List';
import Options from './Options';
import { SelectInputItem } from './SelectInput';

enum returnedValue {
  seeDetails,
  downloadDirectly,
  addToBulkDownloadingQueue,
  removeFromBulkDownloadingQueue,
  turnBackToTheList
}

const Results = () => {
  const currentPage: number = useStore(state => state.globals.currentPage);
  const pageSize: number = useStore(state => state.config?.pageSize) || 25;
  const entries: Entry[] = useStore(state => state.globals.entries);

  const bulkQueue: string[] = useStore(state => state.globals.bulkQueue);
  const setBulkQueue: (bulkQueue: string[]) => void = useStore(state => state.set.bulkQueue);

  const generateSelectInputItems = (checked: boolean): SelectInputItem<returnedValue>[] => ([
    {
      label: 'See Details',
      value: returnedValue.seeDetails
    },
    {
      label: 'Dowload Directly',
      value: returnedValue.downloadDirectly
    },
    {
      label: !checked ? 'Add To Bulk Downloading Queue' : 'Remove From Bulk Downloading Queue',
      value: !checked ? returnedValue.addToBulkDownloadingQueue : returnedValue.removeFromBulkDownloadingQueue
    },
    {
      label: 'Turn Back To The List',
      value: returnedValue.turnBackToTheList
    }
  ]);

  const handleOnSelect = (expanded: boolean, setExpanded: Function, entryData: Entry, returned: returnedValue) => {
    switch (returned) {
      case returnedValue.turnBackToTheList:
        setExpanded(!expanded);
      break;

      case returnedValue.addToBulkDownloadingQueue:
        setBulkQueue([ ...bulkQueue,  entryData.id ]);
      break;

      case returnedValue.removeFromBulkDownloadingQueue:
        setBulkQueue(bulkQueue.filter((id: string) => id != entryData.id));
      break;
    }
  }

  return (
    <Box flexDirection='column'>
      <Text wrap='truncate'>
        Press [TAB] to switch between 'list' and 'buttons'
      </Text>
      <List 
        entries={entries}
        currentPage={currentPage}
        pageSize={pageSize}
        bulkQueue={bulkQueue}
        generateSelectInputItems={generateSelectInputItems}
        handleOnSelect={handleOnSelect}/>
      <Options />
    </Box>
  )
};

export default Results;
