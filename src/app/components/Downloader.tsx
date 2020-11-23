import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
// @ts-ignore
import pretty from 'prettysize';
import {  error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { useStore } from '../../store-provider';
import { Entry } from '../../search-api';
import { findDownloadURL, startDownloading } from '../../download-api';

const Downloader = () => {
  const [ running, setRunning ] = useState(false);
  const [ totalFiles, setTotalFiles ] = useState(0);
  const [ completedFiles, setCompletedFiles ] = useState(1);
  const [ chunkLen, setChunkLen ] = useState(0);
  const [ total, setTotal ] = useState(0);
  const [ filename, setFilename ] = useState('');

  const downloadQueue: Entry[] = useStore(state => state.globals.downloadQueue);
  const setDownloadQueue: (callback: Function) => void = useStore(state => state.set.downloadQueue);

  useEffect(() => {
    setTotalFiles(downloadQueue.length);

    if (downloadQueue.length > 0 && !running) {
      setRunning(true);

      const operateQueue = async () => {
        while (useStore.getState().globals.downloadQueue.length > 0) {
          const entryBuffer: Entry = useStore.getState().globals.downloadQueue[0];

          if (!entryBuffer) break;

          const endpoint: string | null = await findDownloadURL(entryBuffer.mirror, () => {}, error_tolarance, error_reconnect_delay_ms);

          if (!endpoint) {
            setRunning(false);
            return;
          }

          await startDownloading(
            endpoint, 
            error_tolarance, 
            error_reconnect_delay_ms, 
            () => {}, 
            (chunklen: number, total: number, dir: string, filename: string) => {
              setChunkLen((prev => prev + chunklen));
              setTotal(total);
              setFilename(filename);
            },
            () => {
            }
          )

          setCompletedFiles(prev => prev + 1);
          setChunkLen(0);
          setTotal(0);
          setFilename('');

          setDownloadQueue((arr: Entry[]) => arr.slice(1));
        }

        setRunning(false);
      }

      operateQueue();
    }
  }, [downloadQueue]);

  return (
    <Box flexDirection='column'>
      {
        downloadQueue.length > 0 &&
        <Text>
          Downloading:&nbsp; 
          <Text color='greenBright'>{completedFiles} / {totalFiles}</Text>
          &nbsp;to&nbsp;
          <Text color='blueBright'>{process.cwd()}</Text>
        </Text>
      }
      {
        running && chunkLen != 0 && total != 0 && filename != '' && 
        <Box flexDirection='column'>
          <Text wrap='truncate'>
            <Text color='greenBright'>{(100 / total * chunkLen).toFixed(2)}%</Text>
            &nbsp;
            <Text color='redBright'>{pretty(chunkLen)} / {pretty(total)}</Text>
            &nbsp;
            <Text color='yellow'>{filename}</Text>
          </Text>
        </Box>
      }
    </Box>
  )
}

export default Downloader;
