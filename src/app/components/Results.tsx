import React from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';
import { useStore, AppStatus, returnedValue } from '../../store-provider';
import { Entry } from '../../search-api';
import List from './List';
import { SelectInputItem } from './SelectInput';

const Results = () => {
  const pageSize: number = useStore(state => state.config?.pageSize) || 25;

  const nextPage: boolean = useStore(state => state.globals.nextPage);

  const currentPage: number = useStore(state => state.globals.currentPage);
  const setCurrentPage: (currentPage: number) => void = useStore(state => state.set.currentPage);

  const filters: [ string, string ][] = Object.entries(useStore(state => state.globals.searchFilters))
  .filter(([ _, value ]) => (value.trim() != ''));

  let entries: Entry[] = useStore(state => state.globals.entries);

  if (filters.length > 0) {
    entries = entries.filter((entry: Entry) => {
      const pairs: [string, string][] = Object.entries(entry);

      const matchedPairs: number = pairs.filter(([ key, value ]) => {
        const filter = filters.filter(([ fkey, _ ]) => key == fkey);

        if (filter.length == 0) return false;

        const fvalue: string = filter[0][1];

        return value.trim().toLowerCase().includes(fvalue.trim().toLowerCase());
      }).length;

      return matchedPairs == filters.length;
    });
  }

  const bulkQueue: string[] = useStore(state => state.globals.bulkQueue);

  const setBulkQueue: (bulkQueue: string[]) => void = useStore(state => state.set.bulkQueue);
  const setEntryBuffer: (entryBuffer: Entry) => void = useStore(state => state.set.entryBuffer);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  const options: SelectInputItem[] = [
    {
      label: `?  Search`,
      value: returnedValue.search
    },
    {
      label: `${figures.arrowRight}  Next Page`,
      value: returnedValue.nextPage,
      disabled: !nextPage
    },
    {
      label: `${figures.arrowLeft}  Previous Page`,
      value: returnedValue.prevPage,
      disabled: currentPage == 1
    },
    {
      label: `@  Start Bulk Downloading`,
      value: returnedValue.startBulkDownloading,
      disabled: true
    },
    {
      label: `${figures.cross}  Exit`,
      value: returnedValue.exit
    }
  ]

  const generateSelectInputItems = (checked: boolean): SelectInputItem[] => ([
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

  const handleOnSelect = (expanded: boolean, setExpanded: Function, entryData: Entry | null, returned: returnedValue) => {
    switch (returned) {
      case returnedValue.seeDetails:
        if (entryData) {
          setEntryBuffer(entryData);
          setStatus('entryDetails');
        }
      break;

      case returnedValue.addToBulkDownloadingQueue:
        if (entryData) {
          setBulkQueue([ ...bulkQueue,  entryData.id ]);
        }
      break;

      case returnedValue.removeFromBulkDownloadingQueue:
        if (entryData) {
          setBulkQueue(bulkQueue.filter((id: string) => id != entryData.id));
        }
      break;

      case returnedValue.turnBackToTheList:
        setExpanded(!expanded);
      break;

      case returnedValue.nextPage:
        setCurrentPage(currentPage + 1);
        setStatus('gettingResults');
      break;

      case returnedValue.prevPage:
        setCurrentPage(currentPage - 1);
        setStatus('gettingResults');
      break;

      case returnedValue.search:
        setStatus('search');
      break;
    }
  }

  return (
    <Box flexDirection='column'>
      <List 
        entries={entries}
        options={options}
        currentPage={currentPage}
        pageSize={pageSize}
        bulkQueue={bulkQueue}
        generateSelectInputItems={generateSelectInputItems}
        handleOnSelect={handleOnSelect}/>
      <Text wrap='truncate'>
        [UP] and [DOWN] arrow keys to reveal listings, [ENTER] key to interact
      </Text>
    </Box>
  )
};

export default Results;
