import config from "./config";

const URL_Parts = {
    MIRROR: config.MIRROR,
    SEARCH_PAGE: 'search.php',
    PARAMS: {
        QUERY: 'req',
        PAGE_SIZE: 'res',
        SORT_MODE: 'sort_mode',
        PAGE: 'page'
    }
}

const getUrl = (query: string, pageNumber: number): string => {
    return "";
}