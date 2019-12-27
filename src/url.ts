import config from "./config";

const URL_Parts = {
    MIRROR: config.MIRROR,
    SEARCH_PAGE: 'search.php',
    PARAMS: {
        QUERY: 'req',
        PAGE: 'page',
        PAGE_SIZE: 'res',
        SORT_MODE: 'sort_mode',
        SORT_MODE_VAL: 'ASC'
    }
}

export const getUrl = (query: string, pageNumber: number): string => {
    let url: string = URL_Parts.MIRROR;

    url += `${URL_Parts.SEARCH_PAGE}?`;

    url += `&${URL_Parts.PARAMS.QUERY}=${query}`;
    url += `&${URL_Parts.PARAMS.PAGE}=${pageNumber}`;
    url += `&${URL_Parts.PARAMS.PAGE_SIZE}=${config.REQUEST_PAGE_SIZE}`
    url += `&${URL_Parts.PARAMS.SORT_MODE}=${URL_Parts.PARAMS.SORT_MODE_VAL}`;

    return url;
}