import App from '../App';
import Entries from '../modules/Entries';

import CONFIG from '../config';
import CONSTANTS from '../constants';
import { DOWNLOADING } from '../outputs';

import { Response } from 'node-fetch';
import contentDisposition from 'content-disposition';

import fs from 'fs';

export default abstract class Downloader {
    public static async findEntriesMD5(entryIDArr: string[]): Promise<{md5: string}[] | void> {
        App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_ENTRY_DATA);
        App.spinner.start();

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
                App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_ENTRY_DATA_ERR
                    .replace('{errCounter}', errCounter.toString())
                    .replace('{errTolarance}', errTolarance.toString()));
                await App.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
            } else {
                connectionSucceed = true;
            }
        }

        if (App.state.runtimeError) {
            App.spinner.stop(true);
            return;
        }

        try {
            MD5Arr = await MD5Response.json();

            App.spinner.stop(true);
        } catch(err) {
            App.spinner.stop(true);
            console.log(CONSTANTS.JSON_PARSE_ERR, err);

            App.state.runtimeError = true;
            return;
        }

        return MD5Arr;
    }

    public static async findDownloadURL(entryMD5: string): Promise<string> {
        App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_DOWNLOAD_URL);
        App.spinner.start();

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
                App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_DOWNLOAD_URL_ERR
                    .replace('{errCounter}', errCounter.toString())
                    .replace('{errTolarance}', errTolarance.toString()));
                await App.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
            } else if (mirrorDocument){
                downloadEndpoint = Entries.getDownloadURL(mirrorDocument);
                connectionSucceed = true;    
            }
        }

        App.spinner.stop(true);

        return downloadEndpoint;
    }

    public static startDownloading(downloadEndpoint: string, onData: Function): Promise<string> {
        return new Promise(async (resolve: Function) => {
            App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.STARTING_DOWNLOAD);
            App.spinner.start();

            let connectionSucceed: boolean = false;

            let errTolarance: number = CONFIG.ERR_TOLERANCE;
            let errCounter: number = 0;

            let downloadResponse: Response = new Response();

            while (errCounter < errTolarance && !connectionSucceed) {
                App.state.runtimeError = false;

                downloadResponse = await App.getResponse(downloadEndpoint);

                if (App.state.runtimeError) {
                    errCounter++;
                    App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.STARTING_DOWNLOAD_ERR
                        .replace('{errCounter}', errCounter.toString())
                        .replace('{errTolarance}', errTolarance.toString()));
                    await App.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
                } else {
                    connectionSucceed = true;
                }
            }

            App.spinner.stop(true);

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
                console.log(CONSTANTS.DOWNLOAD_ERR);
                App.state.runtimeError = true;
            });
            
            downloadResponse.body.pipe(file);
        });
    }
}
