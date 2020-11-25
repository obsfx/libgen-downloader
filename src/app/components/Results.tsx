import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import figures from 'figures';
import InkSpinner from 'ink-spinner';
import { useStore, AppStatus, returnedValue } from '../../store-provider';
import { Entry } from '../../search-api';
import List, { ListEntry } from './List';
import { SelectInputItem } from './SelectInput';
import BulkQueueIndicator from './BulkQueueIndicator';

const Results = () => {
  const { exit } = useApp();

  const [ bulkWarning, setBulkWarning ] = useState(false);

  const pageSize: number = useStore(state => state.config?.pageSize) || 25;
  const query: string = useStore(state => state.globals.query);

  const nextPage: boolean = useStore(state => state.globals.nextPage);

  const currentPage: number = useStore(state => state.globals.currentPage);
  const setCurrentPage: (currentPage: number) => void = useStore(state => state.set.currentPage);

  const filters: [ string, string ][] = Object.entries(useStore(state => state.globals.searchFilters))
  .filter(([ _, value ]) => (value.trim() != ''));

  let entries: ListEntry[] = useStore(state => state.globals.entries).map((entry: Entry, i: number) => ({
    idx: i,
    data: entry
  }));

  const totalEntries: number = entries.length;

  if (filters.length > 0) {
    entries = entries.filter((entry: ListEntry) => {
      const pairs: [string, string][] = Object.entries(entry.data);

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
  const setDownloadQueue: (callback: Function) => void = useStore(state => state.set.downloadQueue);
  const setEntryBuffer: (entryBuffer: Entry) => void = useStore(state => state.set.entryBuffer);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  const options: SelectInputItem[] = [
    {
      label: <Text>?  Search</Text>,
      value: returnedValue.search
    },
    {
      label: <Text>{figures.arrowRight}  Next Page</Text>,
      value: returnedValue.nextPage,
      disabled: !nextPage
    },
    {
      label: <Text>{figures.arrowLeft}  Previous Page</Text>,
      value: returnedValue.prevPage,
      disabled: currentPage == 1
    },
    {
      label: <Text>@  Start Bulk Downloading</Text>,
      value: returnedValue.startBulkDownloading,
    },
    {
      label: <Text>{figures.cross}  Exit</Text>,
      value: returnedValue.exit
    }
  ];

  const generateSelectInputItems = (inBulkQueue: boolean, inDownloadQueue: boolean): SelectInputItem[] => ([
    {
      label: <Text>See Details</Text>,
      value: returnedValue.seeDetails
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
    },
    {
      label: <Text>Turn Back To The List</Text>,
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

      case returnedValue.downloadDirectly:
        if (entryData) {
          setDownloadQueue((queue: string[]) => [ ...queue, entryData ]);
        }
      break;

      case returnedValue.addToBulkDownloadingQueue:
        if (entryData) {
          setBulkQueue([ ...bulkQueue, entryData.id ]);
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

      case returnedValue.startBulkDownloading:
        if (bulkQueue.length > 0) {
          setStatus('bulkDownloadingID');
      } else if (!bulkWarning) {
        setBulkWarning(true);
        setTimeout(() => {
          setBulkWarning(false);
        }, 2000);
      }
      break;

      case returnedValue.search:
        setStatus('search');
      break;

      case returnedValue.exit: 
        exit();
        process.exit(0);
    }
  }

  return (
    <Box flexDirection='column'>
      <Box>
        <Text wrap='truncate'>
          <Text>Results for </Text>
          <Text color='greenBright'>'{decodeURIComponent(query)}' </Text>
          <Text>Page </Text>
          <Text color='yellowBright'>{currentPage}</Text>
        </Text>
      </Box>
      {
        filters.length > 0 && 
        <Box>
          <Text wrap='truncate'>
            <Text>Filters applied </Text>
            <Text>Showing </Text>
            <Text color='bold'>{entries.length} </Text>
            <Text>of </Text>
            <Text color='bold'>{totalEntries} </Text>
          </Text>
        </Box>
      }
      {
        bulkWarning && <Text color='yellow' bold={true}>Bulk Downloading Queue is Empty</Text>
      }
      <BulkQueueIndicator />
      <List 
        entries={entries}
        options={options}
        pageSize={pageSize}
        generateSelectInputItems={generateSelectInputItems}
        handleOnSelect={handleOnSelect}/>
      <Text wrap='truncate'>
        [UP] and [DOWN] arrow keys to reveal listings, [ENTER] key to interact
      </Text>
    </Box>
  )
};

export default Results;
