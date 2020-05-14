import App from './app/App';
import UI from './ui';

import CONSTANTS from './app/constants';

const main = async (): Promise<void> => {
    UI.Main.init();

    UI.Terminal.setBulkDownloadOptionText(CONSTANTS.BULK_DOWNLOAD_INDICATOR_TEXT);
    UI.Terminal.setIndicatorText(CONSTANTS.BULK_QUEUE_INDICATOR_TEXT);

    App.initEventHandlers();
    App.init();
}

main();