import fetch, { Response } from 'node-fetch';
import { JSDOM } from 'jsdom';
import { sleep } from './utils';
import { useStore, Entry } from './store-provider';
import config from './config.json';

export default abstract class SearchAPI {
  private static async getResponse(url: string): Promise<Response | null> {
    try {
      const response: Response = await fetch(url);
      return (response.status == 200 && !response.redirected) ?
        response :
        null;
    } catch(error) {
      const setErrorStatus: (errorStatus: boolean) => void = useStore(state => state.setErrorStatus);
      setErrorStatus(true);
      return null;
    }
  }

  private static async getDocument(url: string): Promise<HTMLDocument | null> {
    let response: Response | null = await this.getResponse(url);

    if (response == null) {
      return null;
    }

    const plainText: string = await response.text();
    return new JSDOM(plainText).window.document;
  }

  public static doRequest(reqUrl: string, onErr: (attempt: number, tolarance: number) => void, errTolarance: number, delay: number): Promise<Response | null> {
    return new Promise(async (resolve: Function) => {
      let errCount: number = 0;
      let response: Response | null = null;

      const setErrorStatus: (errorStatus: boolean) => void = useStore(state => state.setErrorStatus);

      while (errCount < errTolarance) {
        setErrorStatus(false);
        response = await this.getResponse(reqUrl);

        if (response == null) {
          errCount++;
          onErr(errCount + 1, errTolarance);
          await sleep(delay);
        } else {
          resolve(response);
          break;
        }
      }
    })
  }

  public static search(mirror: string, query: string, pageNumber: number): Entry[] {
    const reqURL: string = config.SEARCH_REQ
    .replace('{mirror}', mirror)
    .replace('{query}', query)
    .replace('{pageNumber}', pageNumber.toString());
  }
}
