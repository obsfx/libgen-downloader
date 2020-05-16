import App from './app/App';
import UI from './ui';

import CONSTANTS from './app/constants';

const main = async (): Promise<void> => {
    UI.Main.init();

    UI.Terminal.setBulkDownloadOptionText(CONSTANTS.BULK_DOWNLOAD_INDICATOR_TEXT);
    UI.Terminal.setIndicatorText(CONSTANTS.BULK_QUEUE_INDICATOR_TEXT);

    App.spinner.setSpinnerString(0);
    App.spinner.setSpinnerDelay(60);

    App.initEventHandlers();
    App.init();
}

main();