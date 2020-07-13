import { Colors } from '../ui';

import CONFIG from './config';

export default {
    /* ******************** OUTPUTS ******************* */

    REMAINING_BOOKS: Colors.get('white', '[Remaining Books: %s]'),

    MD5_INDICATOR: `MD5: ${Colors.get('green', '%s')}`,

    LIST_EXPORT_SUCCESS: `${Colors.get('green', 'List of MD5(s) of Downloaded Book(s) Successfully Created.')} ${Colors.get('byellow', '%s')}`,

    LIST_EXPORT_ERR: Colors.get('red', 'List of MD5(s) of Downloaded Book(s) Couldn\'t Created.'),

    DOWNLOAD_URL: `Here is your download URL: ${Colors.get('yellow', '%s')}`,

    BULK_DOWNLOAD_TITLE: `─ ${Colors.get('cyan', 'Bulk Downloader')}\n`,

    HELP: [
        `${Colors.get('byellow', 'libgen-downloader')}  start the main app without any argument.`,
        `${Colors.get('byellow', 'libgen-downloader')} ${Colors.get('cyan', '--help')}  see available additional arguments.`,
        `${Colors.get('byellow', 'libgen-downloader')} ${Colors.get('cyan', '--bulk=md5listfile.txt')}  start bulk downloading with an already exist .txt file which holds MD5(s) of books line by line.`,
        `${Colors.get('byellow', 'libgen-downloader')} ${Colors.get('cyan', '--geturl=md5')}  get the download url of book by passing the md5.`,
    ],

    JSON_PARSE_ERR: Colors.get('red', 'Invalid JSON Error.'),
    DOWNLOAD_ERR: Colors.get('red', 'Downloading couldn\'t completed.'),
    FILE_READ_ERR: Colors.get('red', 'File couldn\'t read.'),

    STRING_REPLACE_REGEX: /(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,

    MD5_REQ_PATTERN: `${CONFIG.MIRROR}json.php?ids={ID}&fields=md5`,
    MD5_DOWNLOAD_PAGE_PATTERN: `${CONFIG.DOWNLOAD_MIRROR}main/{MD5}`
}
