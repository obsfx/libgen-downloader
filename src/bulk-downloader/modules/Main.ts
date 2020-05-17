import { Types } from '../types.namespace';

import CONSTANTS from '../../app/constants';

import App from '../../app/App';
import Downloader from '../../app/modules/Downloader';

export default abstract class Main {
    private static queue: string[];

    public static async start(ID_or_MD5Arr: string[], downloadMode: Types.bulkDownloadMode) {
        this.queue = ID_or_MD5Arr;

        if (downloadMode == 'ID') {
            let entryMD5Arr: { md5: string }[] | void = await Downloader.findEntriesMD5(ID_or_MD5Arr);

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
            console.log(CONSTANTS.REMAINING_BOOKS, this.queue.length - i);

            let URL: string = await Downloader.findDownloadURL(this.queue[i]);

            if (App.state.runtimeError) {
                console.log(CONSTANTS.DOWNLOAD_ERR);
                continue;
            }

            let filename: string = await Downloader.startDownloading(URL);

            console.log(CONSTANTS.DOWNLOAD_COMPLETED, filename);
        }

        console.log(CONSTANTS.BULK_DOWNLOAD_COMPLETED);
        
        App.promptAfterDownload();
    }
}