import App from '../App';
import Entries from '../modules/Entries';

import CONFIG from '../config';
import CONSTANTS from '../constants';
import { 
    SPINNER,
    JSON_PARSE_ERR,
    DOWNLOADING
} from '../outputs';

import { Response } from 'node-fetch';
import contentDisposition from 'content-disposition';

import fs from 'fs';

export default abstract class Downloader {
    public static async findEntriesMD5(entryIDArr: string[], logmode: boolean = false): Promise<{md5: string}[] | void> {
        App.spinner.setSpinnerTitle(SPINNER.GETTING_ENTRY_DATA);
        App.spinner.start(logmode);

        let connectionSucceed: boolean = false;

        let errTolarance: number = CONFIG.ERR_TOLERANCE;
        let errCounter: number = 0;

        let MD5Arr: { md5: string }[];
        let MD5ReqURL: string = '';
        let MD5Response: Response = new Response();

        let entryIDs: string = entryIDArr.join(',');

        while (errCounter < errTolarance && !connectionSucceed) {
            App.state.runtimeError = false;

            MD5ReqURL = CONSTANTS.MD5_REQ_PATTERN.replace('{ID}', entryIDs);
            MD5Response = await App.getResponse(MD5ReqURL);

            if (App.state.runtimeError) {
                errCounter++;
                App.spinner.setSpinnerTitle(SPINNER.GETTING_ENTRY_DATA_ERR
                    .replace('{errCounter}', errCounter.toString())
                    .replace('{errTolarance}', errTolarance.toString()));
                await App.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
            } else {
                connectionSucceed = true;
            }
        }

        if (App.state.runtimeError) {
            App.spinner.stop();
            return;
        }

        try {
            MD5Arr = await MD5Response.json();

            App.spinner.stop();
        } catch(err) {
            App.spinner.stop();
            console.log(JSON_PARSE_ERR, err);

            App.state.runtimeError = true;
            return;
        }

        return MD5Arr;
    }

    public static async findDownloadURL(entryMD5: string, logmode: boolean = false): Promise<string> {
        App.spinner.setSpinnerTitle(SPINNER.GETTING_DOWNLOAD_URL);
        App.spinner.start(logmode);

        let connectionSucceed: boolean = false;

        let errTolarance: number = CONFIG.ERR_TOLERANCE;
        let errCounter: number = 0;
        
        let mirrorURL: string;
        let mirrorDocument: HTMLDocument | void;
        let downloadEndpoint: string = '';

        while (errCounter < errTolarance && !connectionSucceed) {
            App.state.runtimeError = false;

            mirrorURL = CONSTANTS.MD5_DOWNLOAD_PAGE_PATTERN.replace('{MD5}', entryMD5);
            mirrorDocument = await App.getDocument(mirrorURL);

            if (App.state.runtimeError || !mirrorDocument) {
                errCounter++;
                App.spinner.setSpinnerTitle(SPINNER.GETTING_DOWNLOAD_URL_ERR
                    .replace('{errCounter}', errCounter.toString())
                    .replace('{errTolarance}', errTolarance.toString()));
                await App.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
            } else if (mirrorDocument){
                downloadEndpoint = Entries.getDownloadURL(mirrorDocument);
                connectionSucceed = true;    
            }
        }

        App.spinner.stop();

        return downloadEndpoint;
    }

    public static startDownloading(downloadEndpoint: string, onData: Function, logmode: boolean = false): Promise<string> {
        return new Promise(async (resolve: Function) => {
            App.spinner.setSpinnerTitle(SPINNER.STARTING_DOWNLOAD);
            App.spinner.start(logmode);

            let connectionSucceed: boolean = false;

            let errTolarance: number = CONFIG.ERR_TOLERANCE;
            let errCounter: number = 0;

            let downloadResponse: Response = new Response();

            while (errCounter < errTolarance && !connectionSucceed) {
                App.state.runtimeError = false;

                downloadResponse = await App.getResponse(downloadEndpoint);

                if (App.state.runtimeError) {
                    errCounter++;
                    App.spinner.setSpinnerTitle(SPINNER.STARTING_DOWNLOAD_ERR
                        .replace('{errCounter}', errCounter.toString())
                        .replace('{errTolarance}', errTolarance.toString()));
                    await App.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
                } else {
                    connectionSucceed = true;
                }
            }

            App.spinner.stop();

            if (App.state.runtimeError) {
                resolve('');
                return;
            }

            let parsedContentDisposition: {
                type: string,
                parameters: { filename: string }
            } = contentDisposition.parse(downloadResponse.headers.get('content-disposition') || '');

            if (parsedContentDisposition.type != 'attachment') {
                App.state.runtimeError = true;
                resolve(parsedContentDisposition.parameters.filename);
                return;
            }

            let fullFileName: string = `./${parsedContentDisposition.parameters.filename}`;

            let file: fs.WriteStream = fs.createWriteStream(fullFileName);

            let total: number = Number(downloadResponse.headers.get('content-length') || 0);
            let dir: string = process.cwd();
            let filename: string = parsedContentDisposition.parameters.filename;

            downloadResponse.body.on('data', chunk => {
                onData(chunk.length, total, dir, filename);
            });

            downloadResponse.body.on('finish', async () => {
                resolve(parsedContentDisposition.parameters.filename);
            });
            
            downloadResponse.body.on('error', () => {
                console.log(DOWNLOADING.ERR);
                App.state.runtimeError = true;
            });
            
            downloadResponse.body.pipe(file);
        });
    }

    public static async download(entryID: string, onData: Function): Promise<void | string> {
        let entryMD5Arr: { md5: string }[] | void = await this.findEntriesMD5([entryID]);

        let URL: string = '';

        if (App.state.runtimeError) {
            return;
        }

        if (entryMD5Arr) {
            URL = await this.findDownloadURL(entryMD5Arr[0].md5);
        }

        if  (App.state.runtimeError) {
            return;
        }

        let fileName: string = await Downloader.startDownloading(URL, onData);

        if (App.state.runtimeError) {
            App.runtimeError();
            return;
        }

        return fileName;
    }
}
