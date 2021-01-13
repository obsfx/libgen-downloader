import { useEffect } from 'react';
import { error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { findMD5s, findDownloadMirror, findDownloadURL, startDownloading } from '../../download-api';
import { useStore } from '../../store-provider';

type args = {
  mode: 'id' | 'md5';
  onPrepare: () => void;
  onFailed: () => void;
  onQueueUpdated: (queue: QueueItem[]) => void;
  onCompleted: (completedMD5s: string[]) => void;
}

export type QueueItem = {
  md5: string;
  status: 'waiting' | 'downloading' | 'completed' | 'failed' | 'processing';
  progress: number;
  total: number;
  filename: string;
  errorCounter: number;
}

const useBulkDownload = (args: args) => {
  const { 
    mode,
    onPrepare,
    onFailed,
    onQueueUpdated,
    onCompleted
  } = args;

  const mirror: string | null = useStore(state => state.globals.mirror);
  const MD5ReqPattern: string = useStore(state => state.config.MD5ReqPattern);
  const searchByMD5Pattern: string = useStore(state => state.config.searchByMD5Pattern);

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

    const operate = async (): Promise<void> => {
      let pool: string[] | null = useStore.getState().globals.bulkQueue;

      if (mode == 'id') {
        const fetchedMD5List: string[] | null = await findMD5s(
          mirror,
          pool,
          MD5ReqPattern,
          () => {},
          error_tolarance,
          error_reconnect_delay_ms
        );

        if (!fetchedMD5List) {
          onFailed();
          return;
        }

        pool = fetchedMD5List;
      }

      const queue: QueueItem[] = pool.map((md5: string) => ({
        md5,
        status: 'waiting',
        progress: 0,
        total: 0,
        filename: '',
        errorCounter: 0
      }));

      onPrepare();
      onQueueUpdated(queue);

      useStore.getState().set.bulkQueue([]);

      const completedMD5s: string[] = [];

      for (let i: number = 0; i < queue.length; i++) {
        queue[i].status = 'processing';
        onQueueUpdated(queue);

        const md5: string = queue[i].md5;

        const onErr = (attempt: number, _: number) => {
          queue[i].errorCounter = attempt;
          onQueueUpdated(queue);
        }

        const onData = (chunklen: number, total: number, filename: string) => {
          queue[i].status = 'downloading';
          queue[i].progress += chunklen;
          queue[i].total = total;
          queue[i].filename = filename;
          onQueueUpdated(queue);
        } 

        const onEnd = () => {
          queue[i].status = 'completed';
          completedMD5s.push(queue[i].md5);
          onQueueUpdated(queue);
        }

        const downloadMirrorURL: string | null = await findDownloadMirror(
          mirror, 
          searchByMD5Pattern, 
          md5, 
          onErr, 
          error_tolarance, 
          error_reconnect_delay_ms
        );

        if (!downloadMirrorURL) {
          queue[i].status = 'failed';
          onQueueUpdated(queue);
          continue;
        }

        const endpoint: string | null = await findDownloadURL(
          downloadMirrorURL, 
          onErr, 
          error_tolarance, 
          error_reconnect_delay_ms
        );

        if (!endpoint) {
          queue[i].status = 'failed';
          onQueueUpdated(queue);
          continue;
        }

        const status: true | null = await startDownloading(
          endpoint, 
          error_tolarance, 
          error_reconnect_delay_ms, 
          onErr, 
          onData,
          onEnd
        );

        if (!status) {
          queue[i].status = 'failed';
          onQueueUpdated(queue);
          continue;
        }
      }

      onCompleted(completedMD5s);
    }

    operate();
  }, []);
}

export default useBulkDownload;
