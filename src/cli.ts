import commander, { Command } from 'commander'
import fs from 'fs';
import { Response } from 'node-fetch';
import { useStore, AppStatus } from './store-provider';
import { doRequest, findMirror } from './search-api';
import { findDownloadMirror, findDownloadURL } from './download-api';
import { init } from './app';
import { config_endpoint, error_tolarance, error_reconnect_delay_ms } from './app/app-config.json';

const cl: commander.Command = new Command();

cl
  .option('-b, --bulk MD5LIST.txt', 'start the app in bulk downloading mode')
  .option('-u, --url MD5', 'get the download URL')
  .option('-d, --download MD5', 'download the file')

const cli = (argv: string[]): boolean => {
  cl.parse(argv);

  const parameters: { [key: string]: (string | null) } = {
    bulk: cl.bulk || null,
    url: cl.url || null,
    download: cl.download || null
  }

  if (parameters.bulk) {
    bulk(parameters.bulk);
    return true;
  }

  if (parameters.url) {
    url(parameters.url);
    return true;
  }

  if (parameters.download) {
    download(parameters.download);
    return true;
  }

  return false;
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

const url = async (md5: string) => {
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

export default cli;
