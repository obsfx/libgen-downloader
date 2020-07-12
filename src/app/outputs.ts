import { Colors as c } from '../ui';

export const TITLE = [
    `┌ ${c.get('byellow', 'libgen-downloader')} ${c.get('none', '@v1.1.0')}`,
    '├───  Source Code: https://github.com/obsfx/libgen-downloader',
    '└───  NPM Page: https://www.npmjs.com/package/libgen-downloader',
];

export const INPUT_TITLE = `${c.get('bgreen', '?')} ${c.get('none', 'Search :  ')}`

export const CONNECTION_ERROR = `${c.get('red', 'Connection Error.')} ${c.get('none', 'Probably libgen servers are not currently available. Please try again after a while.')}`;

export const DOWNLOAD_COMPLETED = `${c.get('green', 'DOWNLOAD_COMPLETED')}`;

export const DOWNLOAD_COMPLETED_FILE = `${c.get('green', 'DONE')} ${c.get('yellow', '%s')} ${c.get('none', 'downloaded on working directory.')}`;

export const INPUT_MINLEN_WARNING = `${c.get('yellow', 'Search string must contain minimum 3 characters.')} ${c.get('none', 'Please, type in a longer request and try again.')}`;

export const USAGE_INFO = '(UP and DOWN arrow keys to reveal listings, ENTER key to interact.)';

export const RESULTS_TITLE = `${c.get('none', 'Results for:')} ${c.get('green', '\'{query}\'')} ${c.get('none', 'Page:')} ${c.get('yellow', '{page}')}`;

export const NO_RESULT = c.get('cyan', 'No Result.');

export const CATEGORY = { 
    WHICH_CAT: 'Which category will you search in ?',
    SELECTED_CAT: `You are searching in ${c.get('byellow', '{category}')}`
}

export const BULK = {
    QUEUE_LEN: `Files in Bulk Downloading Queue: ${c.get('bgreen', '{count}')}`,
    DOWNLOAD_COMPLETED: `${c.get('green', 'DONE')} ${c.get('byellow', `Bulk Downloading`)} ${c.get('none', 'completed.')} ${c.get('green', '%s / %s')} ${c.get('none', 'item(s) downloaded.')}`,
    NO_FILE: `${c.get('yellow', 'There is no added file to')} ${c.get('bgreen', 'Start Bulk Downloading')}` 
}

export const ENTRY_DETAILS = {
    ID: `${c.get('byellow', 'ID')} ${c.get('none', '{ID}')}`,
    Author: `${c.get('byellow', 'Author')} ${c.get('none', '{Author}')}`,
    Title: `${c.get('byellow', 'Title')} ${c.get('none', '{Title}')}`,
    Publisher: `${c.get('byellow', 'Publisher')} ${c.get('none', '{Publisher}')}`,
    Year: `${c.get('byellow', 'Year')} ${c.get('none', '{Year}')}`,
    Pages: `${c.get('byellow', 'Pages')} ${c.get('none', '{Pages}')}`,
    Lang: `${c.get('byellow', 'Lang')} ${c.get('none', '{Lang}')}`,
    Size: `${c.get('byellow', 'Size')} ${c.get('none', '{Size}')}`,
    Ext: `${c.get('byellow', 'Extension')} ${c.get('none', '{Ext}')}`,
    Mirror: `${c.get('byellow', 'Mirror')} ${c.get('none', '{Mirror}')}`,
}

export const DOWNLOADING = {
    DIR: `${c.get('none', '┌  Your book is being downloaded to this directory:')} ${c.get('cyan', `{dir}`)}`,
    FILE: `${c.get('none', '├───')}  ${c.get('byellow', '{file}')}`
}

export const BAR = `${c.get('green', '└───  Downloading')} ${c.get('none', '{bar} {percent}')}`;
