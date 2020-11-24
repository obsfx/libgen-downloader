import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import figures from 'figures';
import InkSpinner from 'ink-spinner';
// @ts-ignore
import pretty from 'prettysize';
import { error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { useStore, returnedValue, AppStatus } from '../../store-provider';
import { findMD5s, findDownloadMirror, findDownloadURL, startDownloading } from '../../download-api';
import SelectInput, { SelectInputItem } from './SelectInput';

type QueueItem = {
  md5: string;
  status: 'waiting' | 'downloading' | 'completed' | 'failed' | 'processing';
  progress: number;
  total: number;
  filename: string;
}

type DownloaderStates = null | 'findingMD5s' | 'onGoing' | 'failed' | 'completed';

type Props = {
  mode: 'md5' | 'id';
}

const BulkDownloader = (props: Props) => {
  const { mode } = props;
  const { exit } = useApp();

  const [ queue, setQueue ] = useState<QueueItem[]>([])
  const [ downloaderState, setDownloaderState ] = useState<DownloaderStates>(null)
  const [ completedMD5s, setCompletedMD5s ] = useState<string[]>([]);
  const [ errorCounter, setErrorCounter ] = useState(0);

  const mirror: string | null = useStore(state => state.globals.mirror);
  const MD5ReqPattern: string = useStore(state => state.config.MD5ReqPattern);
  const searchByMD5Pattern: string = useStore(state => state.config.searchByMD5Pattern);

  const bulkQueue: string[] = useStore(state => state.globals.bulkQueue);
  const setBulkQueue: (bulkQueue: string[]) => void = useStore(state => state.set.bulkQueue);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  useEffect(() => {
    if (mirror == null) {
      throw new Error('Mirror is null');
    }

    if (!MD5ReqPattern) {
      throw new Error('MD5ReqPattern couldn\'t find in the configuration');
    }

    if (!searchByMD5Pattern) {
      throw new Error('searchByMD5Pattern couldn\'t find in the configuration');
    }

    const onErr = (attempt: number, _: number) => {
      setErrorCounter(attempt);
    }

    if (bulkQueue.length > 0) {
      const setQueueItems = async () => {
        if (mode == 'md5') {
          setQueue(bulkQueue.map((md5: string) => ({
            md5: md5,
            status: 'waiting',
            progress: 0,
            total: 0,
            filename: ''
          })));
        }

        if (mode == 'id') {
          setDownloaderState('findingMD5s');

          const md5list: string[] | null = await findMD5s(mirror, bulkQueue, MD5ReqPattern, onErr, error_tolarance, error_reconnect_delay_ms)

          if (!md5list) {
            setDownloaderState('failed');
            return;
          }

          setErrorCounter(0);

          setQueue(md5list.map((md5: string) => ({
            md5,
            status: 'waiting',
            progress: 0,
            total: 0,
            filename: ''
          })));
        }

        setBulkQueue([]);
      }

      setQueueItems();
      return;
    }

    const operateQueue = async () => {
      setDownloaderState('onGoing');

      for (let i: number = 0; i < queue.length; i++) {
        queue[i].status = 'processing';
        setQueue([...queue]);

        const md5: string = queue[i].md5;
        const downloadMirrorURL: string | null = await findDownloadMirror(mirror, searchByMD5Pattern, md5, onErr, error_tolarance, error_reconnect_delay_ms);

        setErrorCounter(0);

        if (!downloadMirrorURL) {
          queue[i].status = 'failed';
          setQueue([...queue]);
          continue;
        }

        const endpoint: string | null = await findDownloadURL(downloadMirrorURL, onErr, error_tolarance, error_reconnect_delay_ms);

        setErrorCounter(0);

        if (!endpoint) {
          queue[i].status = 'failed';
          setQueue([...queue]);
          continue;
        }

        const onData = (chunkLen: number, total: number, filename: string) => {
          queue[i].status = 'downloading';
          queue[i].progress += chunkLen;
          queue[i].total = total;
          queue[i].filename = filename;
          setQueue([...queue]);
        }

        const onEnd = (filename: string) => {
          queue[i].status = 'completed';
          queue[i].filename = filename;
          setCompletedMD5s(prev => [ ...prev, queue[i].md5 ])
          setQueue([...queue]);
        }

        const status: true | null = await startDownloading(endpoint, error_tolarance, error_reconnect_delay_ms, onErr, onData, onEnd);

        if (!status) {
          queue[i].status = 'failed';
          setQueue([...queue]);
          continue;
        }

        setErrorCounter(0);
      }

      setDownloaderState('completed');
    }

    operateQueue();
  }, [bulkQueue]);

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
        { downloaderState == 'findingMD5s' &&
        <Text>
          <Text color='cyanBright'>
            <InkSpinner type='dots' />
            &nbsp;
          </Text>
          Finding MD5(s) of Book(s)
        </Text>
        }

        { errorCounter > 0 &&
        <Text>
          <Text color='red'>{errorCounter} / {error_tolarance} </Text>
          <Text color='yellow'>Some connection problems occured. Trying again.</Text>
        </Text>
        }

        { downloaderState == 'onGoing'  &&
          <Text>
            <Text>Downloaded: </Text>
            <Text color='greenBright'>{completedMD5s.length} / {queue.length}</Text>
            &nbsp;to&nbsp;
            <Text color='blueBright'>{process.cwd()}</Text>
          </Text>
        }

        { downloaderState == 'failed'  &&
          <Text>
            <Text color='red'>Downloading process failed.</Text>
          </Text>
        }

        { downloaderState == 'completed'  &&
          <Text>
            <Text color='greenBright'>{completedMD5s.length} of {queue.length}</Text>
            <Text> files downloaded successfully</Text>
          </Text>
        }
      </Box>
      <Box flexDirection='column'>
        {
          (downloaderState == 'onGoing' || downloaderState == 'completed') && queue.map((item: QueueItem, i: number) => (
            <Box key={i}>
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

        {
          downloaderState == 'completed' &&
          <Box width='100%'>
            <SelectInput selectInputItems={selectInputItems} onSelect={handleOnSelect} />
          </Box>
        }
      </Box>
    </Box>
  )
}

export default BulkDownloader;
