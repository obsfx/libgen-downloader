import React from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';
import InkSpinner from 'ink-spinner';
import { useStore, AppStatus, returnedValue } from '../../store-provider';
import { Entry } from '../../search-api';
import SelectInput, { SelectInputItem } from './SelectInput';
import BulkQueueIndicator from './BulkQueueIndicator';

const EntryDetails = () => {
  const entryBuffer: Entry | null = useStore(state => state.globals.entryBuffer);

  if (!entryBuffer) return null;

  const bulkQueue: string[] = useStore(state => state.globals.bulkQueue);
  const downloadQueue: string[] = useStore(state => state.globals.downloadQueue);
  const setBulkQueue: (bulkQueue: string[]) => void = useStore(state => state.set.bulkQueue);
  const setDownloadQueue: (callback: Function) => void = useStore(state => state.set.downloadQueue);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  const inBulkQueue: boolean = bulkQueue.indexOf(entryBuffer.id) > -1;
  const inDownloadQueue: boolean = downloadQueue.indexOf(entryBuffer.id) > -1;

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
      label: <Text>Turn Back To The List</Text>,
      value: returnedValue.turnBackToTheList
    },
    {
      label: !inDownloadQueue ? <Text>Dowload Directly</Text> : 
      <Text>
        <Text color='greenBright'>
          <InkSpinner type='dots' />
          &nbsp;
        </Text>
        <Text>This File Will Be Downloaded</Text>
      </Text>,
      value: !inDownloadQueue ? returnedValue.downloadDirectly : returnedValue.empty
    },
    {
      label: !inBulkQueue ? <Text>Add To Bulk Downloading Queue</Text> : <Text>Remove From Bulk Downloading Queue</Text>,
      value: !inBulkQueue ? returnedValue.addToBulkDownloadingQueue : returnedValue.removeFromBulkDownloadingQueue
    }
  ];

  const handleOnSelect = (returned: returnedValue) => {
    switch (returned) {
      case returnedValue.turnBackToTheList:
        setStatus('results');
      break;

      case returnedValue.downloadDirectly:
        setDownloadQueue((queue: string[]) => [ ...queue, entryBuffer.id ]);
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
      <BulkQueueIndicator />
      <Box width='100%'>
        <SelectInput selectInputItems={selectInputItems} onSelect={handleOnSelect} />
      </Box>
    </Box>
  )
};

export default EntryDetails;
