import { useState, useEffect } from 'react';
import { Entry } from '../../search-api';
import { error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { findDownloadURL, startDownloading } from '../../download-api';
import { useStore } from '../../store-provider';

type args = {
  onPrepare: () => void,
  onData: (chunklen: number, total: number, filename: string) => void,
  onErr: () => void,
  onEnd: () => void
}

const useDirectDownload = (args: args) => {
  const { 
    onPrepare,
    onData,
    onErr,
    onEnd,
  } = args;

  const [ started, setStarted ] = useState(false);

  useEffect(() => {
    if (useStore.getState().globals.downloadQueue.length > 0 && !started) {
      const operateQueue = async (): Promise<void> => {
        const shift = (): void => {
          useStore.getState().set.downloadQueue((arr: Entry[]) => arr.slice(1));
        }

        while(useStore.getState().globals.downloadQueue.length > 0) {
          onPrepare();

          const entry: Entry = useStore.getState().globals.downloadQueue[0];

          const endpoint: string | null = await findDownloadURL(
            entry.mirror, 
            onErr, 
            error_tolarance, 
            error_reconnect_delay_ms
          );

          if (!endpoint) {
            shift();
            onErr();
            continue;
          }

          const downloadStarted: true | null = await startDownloading(
            endpoint, 
            error_tolarance, 
            error_reconnect_delay_ms, 
            () => {}, 
            onData, 
            () => {
              onEnd();
              shift();
            }
          );

          if (!downloadStarted) {
            shift();
            onErr();
            continue;
          }
        }

        setStarted(false);
      }

      operateQueue();
      setStarted(true);
    }
  }, [ useStore.getState().globals.downloadQueue.length ]);
}

export default useDirectDownload;
