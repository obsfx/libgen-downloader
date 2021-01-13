import { Response } from 'node-fetch';
import { JSDOM } from 'jsdom';
import contentDisposition from 'content-disposition';
import fs from 'fs';
import { CssSelectors, doRequest, getEntries, Entry } from './search-api';

export const findDownloadURL = async (
  mirrorURL: string, 
  onErr: (attempt: number, tolarance: number) => void, 
  errorTolarance: number, 
  delay: number): Promise<string | null> => {
  const response: Response | null = await doRequest(mirrorURL, onErr, errorTolarance, delay);

  if (response == null) return null;

  const plainText: string = await response.text();
  const document: HTMLDocument = new JSDOM(plainText).window.document;

  return document.querySelector(CssSelectors.downloadURL)?.getAttribute('href') || null;
}

export const startDownloading = (
  endpoint: string, 
  errorTolarance: number,
  delay: number,
  onErr: (attempt: number, tolarance: number) => void,
  onData: (chunkLen: number, total: number, filename: string) => void, 
  onEnd: (filename: string) => void): Promise<true | null> => (
  new Promise(async (resolve: Function) => {
    const downloadResponse: Response | null = await doRequest(endpoint, onErr, errorTolarance, delay);

    if (!downloadResponse) resolve(null);

    let responseContentDisposition: string = '';

    try {
      responseContentDisposition = downloadResponse?.headers.get('content-disposition') || '';
    } catch(e) {
      resolve(null);
    }

    const parsedContentDisposition : {
      type: string,
      parameters: { filename: string }
    } = contentDisposition.parse(responseContentDisposition);

    if (parsedContentDisposition.type != 'attachment') {
      resolve(null);
    }

    if (Buffer.byteLength(parsedContentDisposition.parameters.filename, 'utf8') > 255) {
      const contLen = parsedContentDisposition.parameters.filename.length;
      parsedContentDisposition.parameters.filename = parsedContentDisposition.parameters.filename.substring(contLen - 100, contLen);
    }

    const path: string = `./${parsedContentDisposition.parameters.filename}`;
    const file: fs.WriteStream = fs.createWriteStream(path);

    const total: number = Number(downloadResponse?.headers.get('content-length') || 0);
    const filename: string = parsedContentDisposition.parameters.filename;

    downloadResponse?.body.on('data', chunk => {
      onData(chunk.length, total, filename);
    });

    downloadResponse?.body.on('finish', () => {
      onEnd(filename);
      resolve(true);
    });

    downloadResponse?.body.on('error', () => {
      resolve(null);
    });

    downloadResponse?.body.pipe(file);
  })
);

export const findDownloadMirror = async (
  mirror: string, 
  searchByMD5Pattern: string, 
  md5: string,
  onErr: (attempt: number, tolarance: number) => void,
  errorTolarance: number,
  delay: number): Promise<string | null> => {
  const reqURL: string = searchByMD5Pattern
  .replace('{mirror}', mirror)
  .replace('{md5}', md5);

  const response: Response | null = await doRequest(reqURL, onErr, errorTolarance, delay);

  if (response == null) return null;

  const plainText: string = await response.text();
  const document: HTMLDocument = new JSDOM(plainText).window.document;

  const entries: Entry[] = getEntries(document);

  return entries[0].mirror;
}

export const findMD5s = async (
  mirror: string,
  ids: string[],
  MD5ReqPattern: string,
  onErr: (attempt: number, tolarance: number) => void,
  errorTolarance: number,
  delay: number): Promise<string[] | null> => {
  const idStr: string = ids.join(', ');
  
  const reqURL: string = MD5ReqPattern
  .replace('{mirror}', mirror)
  .replace('{id}', idStr);

  const response: Response | null = await doRequest(reqURL, onErr, errorTolarance, delay);

  if (response == null) return null;

  try {
    const md5JSON:{ md5: string }[] = await response.json();
    return md5JSON.map(({ md5 }) => md5);
  } catch(e) {
    return null;
  }
}
