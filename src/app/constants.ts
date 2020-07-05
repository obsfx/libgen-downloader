import { Colors } from '../ui';

import CONFIG from './config';

export default {
    /*
    HEAD: [
        ['┌', Colors.get('byellow', 'libgen-downloader'), '@v1.1.0'],
        '├───  Source Code: https://github.com/obsfx/libgen-downloader',
        '└───  NPM Page: https://www.npmjs.com/package/libgen-downloader',
    ],
   */ 
    /* ******************** OUTPUTS ******************* */

    BULK_QUEUE_INDICATOR_TEXT: 'Books in Bulk Download Queue:',

    BULK_DOWNLOAD_INDICATOR_TEXT: '@  Start The Bulk Downloading:',

    RESULTS_TITLE: Colors.get('white', 'Results for: \'{query}\' Page: {page}'),

    INPUT_MINLEN_WARNING: `${Colors.get('yellow', 'Search string must contain minimum 3 characters.')} Please, type in a longer request and try again.`,

    CONNECTION_ERROR: `${Colors.get('red', 'Connection Error.')} Probably libgen servers are not currently available. Please try again after a while.`,

    NO_RESULT: `${Colors.get('cyan', 'No Result.')}`,

    DOWNLOAD_COMPLETED: `\n${Colors.get('green', 'DONE')} ${Colors.get('yellow', '%s')} downloaded on working directory.\n`,

    BULK_DOWNLOAD_COMPLETED: `\n${Colors.get('green', 'DONE')} ${Colors.get('byellow', `Bulk Downloading`)} completed. ${Colors.get('green', '%s / %s')} item(s) downloaded.\n`,

    DIRECTORY_STRING: `┌  Your book is being downloaded to this directory:\n├───  ${Colors.get('cyan', `%s`)}`,

    DOWNLOADING_FILE: `├───  ${Colors.get('byellow', '%s')}`,

    REMAINING_BOOKS: Colors.get('white', '[Remaining Books: %s]'),

    MD5_INDICATOR: `MD5: ${Colors.get('green', '%s')}`,

    LIST_EXPORT_SUCCESS: `${Colors.get('green', 'List of MD5(s) of Downloaded Book(s) Successfully Created.')} ${Colors.get('byellow', '%s')}`,

    LIST_EXPORT_ERR: Colors.get('red', 'List of MD5(s) of Downloaded Book(s) Couldn\'t Created.'),

    DOWNLOAD_URL: `Here is your download URL: ${Colors.get('yellow', '%s')}`,

    BULK_DOWNLOAD_TITLE: `─ ${Colors.get('cyan', 'Bulk Downloader')}\n`,

    USAGE_INFO: '(UP and DOWN arrow keys to reveal listings, ENTER key to interact.)',

    SPINNER: {
        GETTING_RESULTS: Colors.get('cyan', '%s Getting Results'),
        GETTING_RESULTS_ERR: `${Colors.get('red', '%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${Colors.get('cyan', 'Getting Results')}`,
        
        GETTING_ENTRY_DATA: Colors.get('cyan', '%s Finding MD5(s) of Book(s)'),
        GETTING_ENTRY_DATA_ERR: ` ${Colors.get('red', '%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${Colors.get('cyan', 'Finding MD5(s) of Book(s)')}`,
                
        GETTING_DOWNLOAD_URL: Colors.get('cyan', '%s Finding The Download URL'),
        GETTING_DOWNLOAD_URL_ERR: `${Colors.get('red', '%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${Colors.get('cyan', 'Finding The Download URL')}`,
        
        STARTING_DOWNLOAD: Colors.get('cyan', '%s Starting Download'),
        STARTING_DOWNLOAD_ERR: `${Colors.get('red', '%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${Colors.get('cyan', 'Starting Download')}`,

        LIST_EXPORT: Colors.get('byellow', '%s Creating a List of MD5(s) of Downloaded Book(s)'),

        READING_MD5_LIST: Colors.get('cyan', '%s Reading File')
    },

    HELP: [
        `${Colors.get('byellow', 'libgen-downloader')}  start the main app without any argument.`,
        `${Colors.get('byellow', 'libgen-downloader')} ${Colors.get('cyan', '--help')}  see available additional arguments.`,
        `${Colors.get('byellow', 'libgen-downloader')} ${Colors.get('cyan', '--bulk=md5listfile.txt')}  start bulk downloading with an already exist .txt file which holds MD5(s) of books line by line.`,
        `${Colors.get('byellow', 'libgen-downloader')} ${Colors.get('cyan', '--geturl=md5')}  get the download url of book by passing the md5.`,
    ],

    JSON_PARSE_ERR: Colors.get('red', 'Invalid JSON Error.'),
    DOWNLOAD_ERR: Colors.get('red', 'Downloading couldn\'t completed.'),
    FILE_READ_ERR: Colors.get('red', 'File couldn\'t read.'),

    PROGRESS_BAR: {
        TITLE: `${Colors.get('green', '└───  Downloading')} [ :bar ] :percent :current`,
        WIDTH: 25,
        COMPLETE: '█',
        INCOMPLETE: ' ',
        RENDER_THROTTLE: 1
    },
    
    PAGINATIONS: {
        SEARCH: '?  Search',
        SEARCH_RESULT_ID: '@SRCAGAIN',
        NEXT_PAGE: '→  Next Page',
        NEXT_PAGE_RESULT_VAL: '@NEXTPAGE',
        PREV_PAGE: '←  Previous Page',
        PREV_PAGE_RESULT_VAL: '@PREVPAGE',
    },

    EXIT: {
        EXIT: 'X  Exit',
        EXIT_RESULT_ID: '@EXIT'
    },

    ENTRY_DETAILS_CHECK: {
        ENTRY_DETAILS_CHECK_ADD: '• Add This Book To Bulk Download Queue',
        ENTRY_DETAILS_CHECK_REMOVE: '• Remove This Book From Bulk Download Queue',
        ENTRY_DETAILS_CHECK_RES_VAL: '@EDCHECK'
    },

    SUBMENU_LISTINGS: {
        CHECK: 'Add To Bulk Download Queue',
        UNCHECK: 'Remove From Bulk Download Queue',
        CLOSEBTN: 'Close The Sublist'
    },

    SEE_DETAILS_LISTING: {
        SEE_DETAILS: 'See Details',
        SEE_DETAILS_RES_VAL: '@SEEDETAILS'
    },

    DOWNLOAD_LISTING: {
        DOWNLOAD_DIRECTLY: 'Download Directly',
        DOWNLOAD: '• Download This Book',
        DOWNLOAD_RES_VAL: '@DOWNLOAD' 
    },

    TURN_BACK_LISTING: {
        TURN_BACK: '• Turn Back To The List',
        TURN_BACK_RESULT_ID: '@TRNBACK',
    },

    SEARCH_ANOTHER_LISTINGS: {
        SEARCH_ANOTHER: '• Search Another Thing',
        SEARCH_ANOTHER_RESULT_ID: '@SRCANOTHER',
    },

    ENTRY_DETAILS_HEAD: {
        ID: `${Colors.get('byellow', 'ID')}`,
        Author: `${Colors.get('byellow', 'Author')}`,
        Title: `${Colors.get('byellow', 'Title')}`,
        Publisher: `${Colors.get('byellow', 'Publisher')}`,
        Year: `${Colors.get('byellow', 'Year')}`,
        Pages: `${Colors.get('byellow', 'Pages')}`,
        Lang: `${Colors.get('byellow', 'Lang')}`,
        Size: `${Colors.get('byellow', 'Size')}`,
        Ext: `${Colors.get('byellow', 'Extension')}`,
        Mirror: `${Colors.get('byellow', 'Mirror')}`,
    },

    STRING_REPLACE_REGEX: /(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,

    MD5_REQ_PATTERN: `${CONFIG.MIRROR}json.php?ids={ID}&fields=md5`,
    MD5_DOWNLOAD_PAGE_PATTERN: `${CONFIG.DOWNLOAD_MIRROR}main/{MD5}`
}
