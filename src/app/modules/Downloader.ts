import { Interfaces } from '../interfaces.namespace'

import App from '../App';
import Entries from '../modules/Entries';

import CONSTANTS from '../constants';
import CONFIG from '../config';

import { Response } from 'node-fetch';
import ProgressBar from 'progress';

import fs from 'fs';

export default abstract class Downloader {
    public static async findEntryInformation(entryID: string): Promise<Interfaces.EntryData | void> {
        App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_ENTRY_DATA);
        App.spinner.start();

        let connectionSucceed: boolean = false;

        let errTolarance: number = CONFIG.ERR_TOLERANCE;
        let errCounter: number = 0;

        let entryData: Interfaces.EntryData;
        let MD5ReqURL: string = '';
        let MD5Response: Response = new Response();

        // CONSTANTS.MD5_REQ_PATTERN = '';
        while (errCounter < errTolarance && !connectionSucceed) {
            App.state.runtimeError = false;

            MD5ReqURL = CONSTANTS.MD5_REQ_PATTERN.replace('{ID}', entryID);
            MD5Response = await App.getResponse(MD5ReqURL);

            if (App.state.runtimeError) {
                errCounter++;
                App.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_ENTRY_DATA_ERR
                    .replace('{errCounter}', errCounter.toString())
                    .replace('{errTolarance}', errTolarance.toString()));
                await App.sleep(CONFIG.ERR_RECONNECT_DELAYMS);

                // debug if (errCounter == 3) {
                //     CONSTANTS.MD5_REQ_PATTERN = `${CONFIG.MIRROR}json.php?ids={ID}&fields=md5`;
                // }
            } else {
                connectionSucceed = true;
            }
        }

        if (App.state.runtimeError) {
            App.spinner.stop(true);
            return;
        }

        try {
            let MD5ResponseJSON: [ Interfaces.EntryData ] = await MD5Response.json();
            entryData = MD5ResponseJSON[0];

            App.spinner.stop(true);
        } catch(err) {
            App.spinner.stop(true);
            console.log(CONSTANTS.JSON_PARSE_ERR, err);

            App.state.runtimeError = true;
            return;
        }

        return entryData;
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

        // CONSTANTS.MD5_DOWNLOAD_PAGE_PATTERN = '';

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

                // if (errCounter == 3) {
                //     CONSTANTS.MD5_DOWNLOAD_PAGE_PATTERN = `${CONFIG.DOWNLOAD_MIRROR}main/{MD5}`
                // }

            } else if (mirrorDocument){
                downloadEndpoint = Entries.getDownloadURL(mirrorDocument);
                connectionSucceed = true;    
            }
        }

        App.spinner.stop(true);

        return downloadEndpoint;
    }

    public static async startDownloading(
        entryData: Interfaces.EntryData, 
        downloadEndpoint: string): Promise<void> {
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
            return;
        }
        
        let fileAuthor: string = entryData.author;
        let fileTitle: string = entryData.title;
        let fileExtension: string = entryData.extension;

        let fileName: string = `${fileAuthor} ${fileTitle}`
                                    .replace(CONSTANTS.STRING_REPLACE_REGEX, '')
                                    .split(' ')
                                    .join('_');

        let fullFileName: string = `./${fileName}.${fileExtension}`;

        let file: fs.WriteStream = fs.createWriteStream(fullFileName);

        let progressBar: ProgressBar = new ProgressBar(CONSTANTS.PROGRESS_BAR.TITLE, {
            width: CONSTANTS.PROGRESS_BAR.WIDTH,
            complete: CONSTANTS.PROGRESS_BAR.COMPLETE,
            incomplete: CONSTANTS.PROGRESS_BAR.INCOMPLETE,
            renderThrottle: CONSTANTS.PROGRESS_BAR.RENDER_THROTTLE,
            total: parseInt(downloadResponse.headers.get('content-length') || '0')
        });

        console.log(CONSTANTS.DIRECTORY_STRING, process.cwd());

        downloadResponse.body.on('data', chunk => {
            progressBar.tick(chunk.length);
        });
        
        downloadResponse.body.on('finish', async () => {
            App.promptAfterDownload(fileName, fileExtension);
        });
        
        downloadResponse.body.on('error', () => {
            console.log(CONSTANTS.DOWNLOAD_ERR);
            App.state.runtimeError = true;
        });
        
        downloadResponse.body.pipe(file);
    }
}