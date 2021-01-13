import React, { useState } from 'react';
import { Box, Text } from 'ink';
// @ts-ignore
import pretty from 'prettysize';
import useDirectDownload from '../hooks/useDirectDownload';
import { Entry } from '../../search-api';
import { useStore } from '../../store-provider';

const Downloader = () => {
  const [ state, setState ] = useState({
    completed: 0,
    totalFiles: 0,
    progress: 0,
    total: 0,
    filename: '',
    lastdownloadedfilename: '',
    status: 'processing',
    error: false,
    showlastdownloaded: false,
  });

  const downloadQueue: Entry[] = useStore(state => state.globals.downloadQueue);

  const onPrepare = (): void => {
    setState(prev => ({
      ...prev,
      totalFiles: prev.totalFiles + 1,
      status: 'processing'
    }));
  }

  const onData = (chunklen: number, total: number, filename: string): void => {
    if (state.filename == '') {
      setState(prev => ({
        ...prev,
        progress: prev.progress + chunklen,
        total: total,
        filename:  filename,
        status: 'downloading'
      }));

      return;
    }

    setState(prev => ({
      ...prev,
      progress: prev.progress + chunklen
    }));
  }

  const onErr = (): void => {
    setState(prev => ({
      ...prev,
      error: true
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        error: false
      }));
    }, 2000);
  }

  const onEnd = (): void => {
    setState(prev => ({
      ...prev,
      completed: prev.completed + 1,
      total: 0,
      progress: 0,
      filename: '',
      lastdownloadedfilename: prev.filename
    }));
  }

  useDirectDownload({
    onPrepare,
    onData,
    onErr,
    onEnd
  });

  return (
    <Box flexDirection='column'>
      {
        state.error &&
        <Text wrap='truncate'>
          <Text color='red'>Last Downloading Process Couldn't Completed</Text>
        </Text>
      }
      {
        state.totalFiles > 0 &&
        <Text wrap='truncate'>
          <Text>DONE: </Text>
          <Text color='greenBright'>{state.completed}</Text> 
          <Text> IN QUEUE: </Text>
          <Text color='yellow'>{downloadQueue.length}</Text>
          <Text> to </Text>
          <Text color='blueBright'>{process.cwd()}</Text>
        </Text>
      }
      {
        state.lastdownloadedfilename != '' && 
        <Text wrap='truncate'>
          <Text>LAST DOWNLOADED: </Text>
          <Text color='yellowBright'>{state.lastdownloadedfilename}</Text>
        </Text>
      }
      {
        downloadQueue.length > 0 && 
        <Text wrap='truncate'>
          { state.status == 'processing' && <Text color='yellowBright' inverse={true}> CONNECTING TO LIBGEN </Text> } 
          { state.status == 'downloading' && 
          <Text>
            <Text color='blueBright' inverse={true}> DOWNLOADING </Text>
            <Text color='greenBright'> {(100 / state.total * state.progress).toFixed(2)}% </Text>
            <Text color='magentaBright'>{pretty(state.progress)}/{pretty(state.total)} </Text>
            <Text color='yellow'>{state.filename}</Text>
          </Text>
          } 
        </Text>
      }
    </Box>
  )
}

export default Downloader;
