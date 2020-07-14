import App from './app/App';

import { 
    EventHandler,
} from './ui';

import {
    DOWNLOADING,
    BULK,
    CONNECTION_ERROR,
    HELP
} from './app/outputs';

import Downloader from './app/modules/Downloader';
import BulkDownloader from './bulk-downloader';

import minimist from 'minimist';

const main = async (): Promise<void> => {
    const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));

    if (typeof argv.bulk == 'string') {
        App.init(true);

        await BulkDownloader.startMD5(argv.bulk);

        if (App.state.runtimeError) {
            App.exit();
            return;
        }

        let result: string = BULK.DOWNLOAD_COMPLETED
                    .replace('{completed}',  BulkDownloader.getCompletedItemsCount().toString())
                    .replace('{total}', BulkDownloader.getEntireItemsCount().toString());

        console.log(result); 
        process.exit(0);
    } else if (typeof argv.geturl == 'string') {
        App.init(true);

        let URL: string = await Downloader.findDownloadURL(argv.geturl);

        if (App.state.runtimeError) {
            console.log(CONNECTION_ERROR);
            return;
        }

        console.log(DOWNLOADING.URL, URL);

        process.exit(0);
    } else if (typeof argv.help == 'boolean') {
        HELP.forEach((e: string) => console.log(e));
        process.exit(0);
    } else {
        EventHandler.emitKeypressEvents();
        EventHandler.init();

        App.initEventHandlers();
        App.init();
    }
}

main();
