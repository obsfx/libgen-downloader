import bent from 'bent';

import { CONFIGURATION_URL } from '../settings';
import { attempt } from './utils';

export interface Config {
  latestVersion: string;
  mirrors: string[];
  searchReqPattern: string;
  searchByMD5Pattern: string;
  MD5ReqPattern: string;
}

export async function fetchConfig(onFail: (failCount: number) => void): Promise<Config | null> {
  const getJSON = bent('json');

  const attemptCallback = async () => {
    return await getJSON(CONFIGURATION_URL);
  };
  const conf: Record<string, any> | null = await attempt(attemptCallback, onFail);

  if (!conf) {
    return null;
  }

  return {
    latestVersion: conf['latest_version'] || '',
    mirrors: conf['mirrors'] || [],
    searchReqPattern: conf['searchReqPattern'] || '',
    searchByMD5Pattern: conf['searchByMD5Pattern'] || '',
    MD5ReqPattern: conf['MD5ReqPattern'] || '',
  };
}

export async function findMirror(mirrors: string[]): Promise<string | null> {
  const getText = bent('string');
  for (let i = 0; i < mirrors.length; i++) {
    const mirror = mirrors[i];
    try {
      await getText(mirror);
      return mirror;
    } catch (error) {}
  }
  return null;
}
