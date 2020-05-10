import { yellow, green, cyan, red } from 'kleur';
import CONFIG from './config';

export default {
    HEAD: [
        `┌  ${yellow().bold('libgen-downloader')}`,
        '├───  github.com/obsfx/libgen-cli-downloader',
        '└───  npmjs.com/package/libgen-downloader',
        ' '
    ],

    INPUT_MINLEN_WARNING: `${yellow().bold('Search string must contain minimum 3 characters.')} Please, type in a longer request and try again.`,
    CONNECTION_ERROR: `${red().bold('Connection Error.')} Probably libgen servers are not currently available. Please try again after a while.`,
    NO_RESULT: `${cyan().bold('No Result.')}`,
    DOWNLOAD_COMPLETED: `\n${green().bold('DONE')} ${yellow().bold(`%s.%s`)} downloaded on working directory.\n`,
    DIRECTORY_STRING: `┌  Your media is being downloaded to this directory:\n├───  ${cyan().bold(`%s`)}`,

    SPINNER: {
        GETTING_RESULTS: `${cyan().bold('Getting Results')}... %s`,
        CONNECTING_MIRROR: `${cyan().bold('Connecting to Mirror (it can take a while depending on the libgen servers)')}... %s`
    },

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

    DOWNLOAD_RES_VAL: '@DOWNLOAD',

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

    ENTRY_DETAILS_QUESTIONS: {
        TURN_BACK: '• Turn Back To The List',
        DOWNLOAD_MEDIA: '• Download This Media'
    },

    AFTER_DOWNLOAD_QUESTIONS: {
        TURN_BACK: '• Turn Back To The List',
        TURN_BACK_RESULT_ID: '@TRNBACK',
    },

    AFTER_NORESULT_QUESTIONS: {
        SEARCH_ANOTHER: '• Search Another Thing',
        SEARCH_ANOTHER_RESULT_ID: '@SRCANOTHER',
        EXIT: 'X Exit',
        EXIT_RESULT_ID: '@EXIT'
    },

    STRING_REPLACE_REGEX: /(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,

    MD5_REQ_PATTERN: `${CONFIG.MIRROR}json.php?ids={ID}&fields=md5`,
    MD5_DOWNLOAD_PAGE_PATTERN: `${CONFIG.DOWNLOAD_MIRROR}main/{MD5}`
}
