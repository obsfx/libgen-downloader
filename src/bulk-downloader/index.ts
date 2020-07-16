import { Types } from './types.namespace';

import { 
    TITLE,
    DOWNLOADING,
    BULK,
    BAR,
    LIST,
    SPINNER,
    FILE_READ_ERR,
    REMAINING_BOOKS,
    MD5_INDICATOR
} from '../app/outputs';

import App from '../app';
import Downloader from '../app/modules/Downloader';

import {
    Terminal,
    ProgressBar
} from '../ui';

import fs from 'fs';

export default abstract class Main {
    private static queue: string[];
    private static completedMD5: string[];
    private static exportedListFileName: string;

    public static async startMD5(filename: string): Promise<void> {
        App.spinner.setSpinnerTitle(SPINNER.READING_MD5_LIST);
        App.spinner.start(true);

        try {
            const MD5: Buffer = await fs.promises.readFile(filename);

            App.spinner.stop();

            await this.start(MD5.toString().split('\n'), 'MD5');
        } catch (error) {
            App.state.runtimeError = true;
            
            App.spinner.stop();
            console.log(FILE_READ_ERR);
        }
    }

    public static async start(ID_or_MD5Arr: string[], downloadMode: Types.bulkDownloadMode) {
        Terminal.cursorXY(0, 0);
        this.exportedListFileName = '';

        TITLE.forEach((e: string) => console.log(e));

        console.log('');
        console.log(BULK.TITLE);

        this.queue = ID_or_MD5Arr;
        this.completedMD5 = [];

        if (downloadMode == 'ID') {
            let entryMD5Arr: { md5: string }[] | void = await Downloader.findEntriesMD5(ID_or_MD5Arr, true);

            if (entryMD5Arr) {
                this.queue = entryMD5Arr.map((e: { md5: string}) => {
                    return e.md5;
                });
            }
        }

        if (App.state.runtimeError) {
            return;
        }

        for (let i: number = 0; i < this.queue.length; i++) {
            console.log(REMAINING_BOOKS, this.queue.length - i);
            console.log(MD5_INDICATOR, this.queue[i]);

            let URL: string = await Downloader.findDownloadURL(this.queue[i], true);

            if (App.state.runtimeError) {
                console.log(DOWNLOADING.ERR);
                continue;
            }

            let progressBar: ProgressBar = new ProgressBar(BAR, true);

            let filename: string = await Downloader.startDownloading(URL, (chunkLen: number, total: number) => {
                if (progressBar.total == null) {
                    progressBar.total = total;
                }

                progressBar.tick(chunkLen);
            }, true);

            progressBar.hide();

            if (App.state.runtimeError) {
                console.log(DOWNLOADING.ERR);
                continue;
            }

            this.completedMD5.push(this.queue[i]);

            console.log(DOWNLOADING.COMPLETED_FILE.replace('{file}', filename));
        }

        if (this.completedMD5.length > 0 && downloadMode == 'ID') {
            App.spinner.setSpinnerTitle(SPINNER.LIST_EXPORT);
            App.spinner.start(true);

            try {
                this.exportedListFileName = `MD5_LIST_${Date.now().toString()}.txt`;
                await fs.promises.writeFile(this.exportedListFileName, this.completedMD5.join('\n'));
                
                App.spinner.stop();
            } catch(e) {
                App.spinner.stop();

                console.log(LIST.EXPORT_ERR, e);
            }
        }
    }

    public static getCompletedItemsCount(): number {
        return this.completedMD5.length;
    }

    public static getEntireItemsCount(): number {
        return this.queue.length;
    }

    public static getExportedListFileName(): string {
        return this.exportedListFileName;
    }
}
