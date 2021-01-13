import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import figures from 'figures';
import InkSpinner from 'ink-spinner';
import fs from 'fs';
// @ts-ignore
import pretty from 'prettysize';
import useBulkDownload, { QueueItem } from '../hooks/useBulkDownload';
import { error_tolarance } from '../app-config.json';
import { useStore, returnedValue, AppStatus } from '../../store-provider';
import SelectInput, { SelectInputItem } from './SelectInput';

type State = {
  queue: QueueItem[];
  status: null | 'findingMD5s' | 'onGoing' | 'failed' | 'completed';
  listExported: string;
}

type Props = {
  mode: 'md5' | 'id';
}

const BulkDownloader = (props: Props) => {
  const { mode } = props;
  const { exit } = useApp();

  const [ state, setState ] = useState<State>({
    queue: [],
    status: mode == 'id' ? 'findingMD5s' : 'onGoing',
    listExported: ''
  });

  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);
  const setLastFailedAction: (lastFailedAction: Function) => void = useStore(state => state.set.lastFailedAction);

  const onPrepare = (): void => {
    setState(prev => ({
      ...prev,
      status: 'onGoing'
    }));
  }

  const onFailed = (): void => {
    setState(prev => ({
      ...prev,
      status: 'failed'
    }));

    setLastFailedAction(() => setStatus('bulkDownloadingID'));
    setStatus('failed');
  }

  const onQueueUpdated = (queue: QueueItem[]): void => {
    setState(prev => ({
      ...prev,
      queue
    }));
  }

  const onCompleted = async (completedMD5s: string[]): Promise<void> => {
    let listfile: string = '';

    if (completedMD5s.length > 0 && mode == 'id') {
      try {
        listfile = `MD5_LIST_${Date.now().toString()}.txt`;
        await fs.promises.writeFile(`./${listfile}`, completedMD5s.join('\n'));
      } catch(e) {  }
    }

    setState(prev => ({
      ...prev,
      status: 'completed',
      listExported: listfile
    }));

    if (mode == 'md5') {
      exit();
    }
  }

  useBulkDownload({
    mode,
    onPrepare,
    onFailed,
    onQueueUpdated,
    onCompleted
  });

  const selectInputItems: SelectInputItem[] = [
    {
      label: <Text>Turn Back To The List</Text>,
      value: returnedValue.turnBackToTheList
    },
    {
      label: <Text>?  Search</Text>,
      value: returnedValue.search
    },
    {
      label: <Text>{figures.cross}  Exit</Text>,
      value: returnedValue.exit
    }
  ];

  const handleOnSelect = (returned: returnedValue) => {
    switch (returned) {
      case returnedValue.turnBackToTheList:
        setStatus('results');
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
        { 
          state.status == 'findingMD5s' &&
          <Text>
            <Text color='cyanBright'>
              <InkSpinner type='dots' />
              &nbsp;
            </Text>
            Finding MD5(s) of Book(s)
          </Text>
        }

        { 
          state.status == 'onGoing'  &&
          <Text>
            <Text>Downloaded: </Text>
            <Text color='greenBright'>{state.queue.filter((item: QueueItem) => item.status == 'completed').length} / {state.queue.length}</Text>
            <Text> to </Text>
            <Text color='blueBright'>{process.cwd()}</Text>
          </Text>
        }

        { 
          state.status == 'failed'  &&
          <Text>
            <Text color='red'>Downloading process failed</Text>
          </Text>
        }

        { 
          state.status == 'completed'  &&
          <Text>
            <Text color='greenBright'>{state.queue.filter((item: QueueItem) => item.status == 'completed').length} of {state.queue.length}</Text>
            <Text> files downloaded successfully</Text>
          </Text>
        }
      </Box>
      <Box>
        { state.status == 'completed' && state.listExported != '' &&
          <Text>
            <Text color='greenBright'>MD5(s) list exported successfully</Text>
            <Text> {state.listExported}</Text>
          </Text>
        }
      </Box>
      <Box flexDirection='column'>
        {
          (state.status == 'onGoing' || state.status == 'completed') && state.queue.map((item: QueueItem, i: number) => (
            <Box key={i} flexDirection='column'>
              {
                (item.errorCounter > 0 && (item.status == 'processing' || item.status == 'downloading')) &&
                <Text>
                  <Text color='red'>{item.errorCounter} / {error_tolarance} </Text>
                  <Text color='yellow'>Some connection problems occured. Trying again.</Text>
                </Text>
              }
              <Text wrap='truncate'>
                { item.status == 'waiting' && <Text color='grey' inverse={true}> IN QUEUE </Text> } 
                { item.status == 'processing' && <Text color='yellowBright' inverse={true}> PROCESSING </Text> } 
                { item.status == 'downloading' && <Text color='blueBright' inverse={true}> DOWNLOADING </Text> } 
                { item.status == 'completed' && <Text color='green' inverse={true}> DONE </Text> } 
                { item.status == 'failed' && <Text color='red' inverse={true}> FAILED </Text> } 

                {
                  item.status != 'downloading' && item.status != 'completed' && <Text bold={true}> {item.md5}</Text>
                }

                {
                  item.status == 'completed' && <Text bold={true}> {item.filename}</Text>
                }

                { item.status == 'downloading' &&
                  <Text>
                    <Text color='greenBright'> {(100 / item.total * item.progress).toFixed(2)}%</Text>
                    &nbsp;
                    <Text color='magentaBright'>{pretty(item.progress)}/{pretty(item.total)}</Text>
                    &nbsp;
                    <Text color='yellow'>{item.filename}</Text>
                  </Text>
                }
              </Text>
            </Box>
          ))
        }

        { state.status == 'completed' && mode == 'id' &&
          <Box width='100%'>
            <SelectInput selectInputItems={selectInputItems} onSelect={handleOnSelect} />
          </Box>
        }
      </Box>
    </Box>
  )
}

export default BulkDownloader;
