import { yellow, green, cyan, red, white } from 'kleur';
import CONFIG from './config';

export default {
    HEAD: [
        `┌  ${yellow().bold('libgen-downloader')} ${cyan().bold('@v1.0')}`,
        '├───  Source Code: https://github.com/obsfx/libgen-downloader',
        '└───  NPM Page: https://www.npmjs.com/package/libgen-downloader',
        ' '
    ],
    
    BULK_QUEUE_INDICATOR_TEXT: 'Books in Bulk Download Queue:',
    BULK_DOWNLOAD_INDICATOR_TEXT: '@  Start The Bulk Downloading:',

    RESULTS_TITLE: white('Results for: \'{query}\' Page: {page}'),

    INPUT_MINLEN_WARNING: `${yellow().bold('Search string must contain minimum 3 characters.')} Please, type in a longer request and try again.`,
    CONNECTION_ERROR: `${red().bold('Connection Error.')} Probably libgen servers are not currently available. Please try again after a while.`,
    NO_RESULT: `${cyan().bold('No Result.')}`,
    DOWNLOAD_COMPLETED: `\n${green().bold('DONE')} ${yellow().bold(`%s.%s`)} downloaded on working directory.\n`,
    DIRECTORY_STRING: `┌  Your media is being downloaded to this directory:\n├───  ${cyan().bold(`%s`)}`,

    SPINNER: {
        GETTING_RESULTS: cyan().bold('%s Getting Results'),
        GETTING_RESULTS_ERR: `${red().bold('%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${cyan().bold('Getting Results')}`,
        
        GETTING_ENTRY_DATA: cyan().bold('%s Finding MD5, Title, Author and Extension Data of Media'),
        GETTING_ENTRY_DATA_ERR: `${red().bold('%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${cyan().bold('Finding MD5, Title, Author and Extension Data of Media')}`,
                
        GETTING_DOWNLOAD_URL: cyan().bold('%s Finding The Download URL'),
        GETTING_DOWNLOAD_URL_ERR: `${red().bold('%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${cyan().bold('Finding The Download URL')}`,
        
        STARTING_DOWNLOAD: cyan().bold('%s Starting Download'),
        STARTING_DOWNLOAD_ERR: `${red().bold('%s CONNECTION ERROR {errCounter}/{errTolarance}')} ${cyan().bold('Starting Download')}`
    },

    JSON_PARSE_ERR: red().bold('Invalid JSON Error'),
    DOWNLOAD_ERR: red().bold('Invalid JSON Error'),

    PROGRESS_BAR: {
        TITLE: `${green().bold('└───  Downloading')} [ :bar ] :percent :current`,
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
        DOWNLOAD: '• Download This Media',
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
        ID: `${yellow().bold('ID')}`,
        Author: `${yellow().bold('Author')}`,
        Title: `${yellow().bold('Title')}`,
        Publisher: `${yellow().bold('Publisher')}`,
        Year: `${yellow().bold('Year')}`,
        Pages: `${yellow().bold('Pages')}`,
        Lang: `${yellow().bold('Lang')}`,
        Size: `${yellow().bold('Size')}`,
        Ext: `${yellow().bold('Extension')}`,
        Mirror: `${yellow().bold('Mirror')}`,
    },

    STRING_REPLACE_REGEX: /(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,

    MD5_REQ_PATTERN: `${CONFIG.MIRROR}json.php?ids={ID}&fields=md5,title,author,extension`,
    MD5_DOWNLOAD_PAGE_PATTERN: `${CONFIG.DOWNLOAD_MIRROR}main/{MD5}`
}
