import App from './app/App';
import { 
    EventHandler,
} from './ui';

import CONSTANTS from './app/constants';

import Downloader from './app/modules/Downloader';
import BulkDownloader from './bulk-downloader';

import minimist from 'minimist';

const main = async (): Promise<void> => {
    const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));

    App.spinner.setSpinnerString(0);
    App.spinner.setSpinnerDelay(60);

    EventHandler.emitKeypressEvents();
    EventHandler.init();

    if (typeof argv.bulk == 'string') {

        App.init(true);

        await BulkDownloader.startMD5(argv.bulk);

        if (App.state.runtimeError) {
            App.exit();
            return;
        }

            //console.log(CONSTANTS.BULK_DOWNLOAD_COMPLETED,  
            //BulkDownloader.Main.getCompletedItemsCount(), BulkDownloader.Main.getEntireItemsCount());

        App.exit();
    } else if (typeof argv.geturl == 'string') {
        App.init(true);

        let URL: string = await Downloader.findDownloadURL(argv.geturl);

        if (App.state.runtimeError) {
            //console.log(CONSTANTS.CONNECTION_ERROR);
            return;
        }

        console.log(CONSTANTS.DOWNLOAD_URL, URL);

        App.exit();
    } else if (typeof argv.help == 'boolean') {
        CONSTANTS.HELP.forEach((e: string) => console.log(e));

        App.exit();
    } else {

//        UI.Terminal.setBulkDownloadOptionText(CONSTANTS.BULK_DOWNLOAD_INDICATOR_TEXT);
//        UI.Terminal.setIndicatorText(CONSTANTS.BULK_QUEUE_INDICATOR_TEXT);

        App.initEventHandlers();
        App.init();
    }
}

main();
