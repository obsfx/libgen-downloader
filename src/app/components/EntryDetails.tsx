import React from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';
import { useStore, AppStatus, returnedValue } from '../../store-provider';
import { Entry } from '../../search-api';
import SelectInput, { SelectInputItem } from './SelectInput';

const EntryDetails = () => {
  const entryBuffer: Entry | null = useStore(state => state.globals.entryBuffer);

  if (!entryBuffer) return null;

  const bulkQueue: string[] = useStore(state => state.globals.bulkQueue);
  const setBulkQueue: (bulkQueue: string[]) => void = useStore(state => state.set.bulkQueue);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  const inBulkQueue: boolean = bulkQueue.includes(entryBuffer.id);

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

  const selectInputItems: SelectInputItem[] = [
    {
      label: 'Turn Back To The List',
      value: returnedValue.turnBackToTheList
    },
    {
      label: 'Download Directly',
      value: returnedValue.turnBackToTheList
    },
    {
      label: !inBulkQueue ? 'Add To Bulk Downloading Queue' : 'Remove From Bulk Downloading Queue',
      value: !inBulkQueue ? returnedValue.addToBulkDownloadingQueue : returnedValue.removeFromBulkDownloadingQueue
    }
  ];

  const handleOnSelect = (returned: returnedValue) => {
    switch (returned) {
      case returnedValue.turnBackToTheList:
        setStatus('results');
      break;

      case returnedValue.downloadDirectly:
      break;

      case returnedValue.addToBulkDownloadingQueue:
        setBulkQueue([ ...bulkQueue,  entryBuffer.id ]);
      break;

      case returnedValue.removeFromBulkDownloadingQueue:
        setBulkQueue(bulkQueue.filter((id: string) => id != entryBuffer.id));
      break;
    }
  }

  return (
    <Box 
      paddingLeft={1}
      borderStyle='single' 
      flexDirection='column'
      width='100%'
      borderColor='grey'>
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

      <Text color='greenBright'>{ inBulkQueue ? `${figures.tick} Added To Bulk Downloading Queue` : ' ' }</Text>
      <Box width='100%'>
        <SelectInput selectInputItems={selectInputItems} onSelect={handleOnSelect} />
      </Box>
    </Box>
  )
};

export default EntryDetails;
