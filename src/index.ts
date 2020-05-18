import App from './app/App';
import UI from './ui';

import CONSTANTS from './app/constants';

import BulkDownloader from './bulk-downloader';

import minimist from 'minimist';

const main = async (): Promise<void> => {
    const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));

    UI.Main.init();

    App.spinner.setSpinnerString(0);
    App.spinner.setSpinnerDelay(60);

    if (typeof argv.md5 == 'string') {
        App.init(true);
        
        UI.Terminal.hideCursor();

        await BulkDownloader.Main.startMD5(argv.md5);

        console.log(CONSTANTS.BULK_DOWNLOAD_COMPLETED);

        App.exit();
    } else {
        UI.Terminal.setBulkDownloadOptionText(CONSTANTS.BULK_DOWNLOAD_INDICATOR_TEXT);
        UI.Terminal.setIndicatorText(CONSTANTS.BULK_QUEUE_INDICATOR_TEXT);

        App.initEventHandlers();
        App.init(true);
    }
}

main();