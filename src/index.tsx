import minimist from 'minimist';
import fs from 'fs';
import { Response } from 'node-fetch';
import { useStore, AppStatus } from './store-provider';
import { doRequest, findMirror } from './search-api';
import { findDownloadMirror, findDownloadURL } from './download-api';
import { init } from './app';
import { config_endpoint, error_tolarance, error_reconnect_delay_ms } from './app/app-config.json';

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));

const help = () => {
  console.log('libgen downloader start the map app witouth passing argument');
  console.log('           --help see available arguments');
  console.log('           --bulk={md5listfile.txt} start bulk downloading with an already exist .txt file which holds MD5(s) of books line by line.');
  console.log('           --geturl={md5} get the download url of file by passing the md5');
  console.log('           --download={md5} directly download the file by passing the md5.');
}

const bulk = async (filename: string) => {
  try {
    const content: Buffer = await fs.promises.readFile(filename);
    const md5arr: string[] = content.toString().split('\n');

    const setInitialStatus: (initialStatus: AppStatus) => void = useStore.getState().set.initialStatus;
    const setBulkQueue: (md5arr: string[]) => void = useStore.getState().set.bulkQueue;

    setInitialStatus('bulkDownloadingMD5');
    setBulkQueue(md5arr);
    init();
  } catch(e) {
    console.log('File couldn\'t read.', e);
  }
}

const geturl = async (md5: string) => {
  const onErr = (attempt: number, _: number) => {
    console.log(`${attempt} / ${error_tolarance} Connection error occured. Trying again`)
  }

  console.log('Fetching Configuration');
  const configResponse: Response | null = await doRequest(config_endpoint, onErr, error_tolarance, error_reconnect_delay_ms);

  if (configResponse == null) {
    // throw error here
    console.log('Failed. Connection Error.');
    return;
  }

  const configJSON = await configResponse.json();

  console.log('Finding An Available Mirror');
  const mirrorList: string[] = configJSON.mirrors || [];
  const mirror: string | null = await findMirror(mirrorList);

  if (mirror == null) {
    // throw error here
    console.log('Failed. Connection Error.');
    return;
  }

  console.log('Finding Download Mirror');
  const downloadMirror: string | null = await findDownloadMirror(mirror, configJSON.searchByMD5Pattern, md5, onErr, error_tolarance, error_reconnect_delay_ms);

  if (downloadMirror == null) {
    console.log('Failed. Connection Error.');
    return;
  }

  console.log('Finding Download URL');
  const endpoint: string | null = await findDownloadURL(downloadMirror, onErr, error_tolarance, error_reconnect_delay_ms);

  console.log('Here is the direct download link: ', endpoint);
}

const download = async (md5: string) => {
  const setInitialStatus: (initialStatus: AppStatus) => void = useStore.getState().set.initialStatus;
  const setBulkQueue: (md5arr: string[]) => void = useStore.getState().set.bulkQueue;

  setInitialStatus('bulkDownloadingMD5');
  setBulkQueue([ md5 ]);
  init();
}

if (typeof argv.help == 'boolean') {
    help();
} else if (typeof argv.bulk == 'string') {
    bulk(argv.bulk);
} else if (typeof argv.geturl == 'string') {
    geturl(argv.geturl);
} else if (typeof argv.download == 'string') {
    download(argv.download);
} else {
    init();
}
