import CONFIG from './config';

export default {
    STRING_REPLACE_REGEX: /(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,

    MD5_REQ_PATTERN: `${CONFIG.MIRROR}json.php?ids={ID}&fields=md5`,
    MD5_SEARCH_PATTERN: `${CONFIG.MIRROR}search.php?req={MD5}&column=md5`
}
