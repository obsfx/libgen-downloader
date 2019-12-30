"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const URL_Parts = {
    MIRROR: config_1.default.MIRROR,
    SEARCH_PAGE: 'search.php',
    PARAMS: {
        QUERY: 'req',
        PAGE: 'page',
        PAGE_SIZE: 'res',
        SORT_MODE: 'sort_mode',
        SORT_MODE_VAL: 'ASC'
    }
};
exports.getUrl = (query, pageNumber) => {
    let url = URL_Parts.MIRROR;
    url += `${URL_Parts.SEARCH_PAGE}?`;
    url += `&${URL_Parts.PARAMS.QUERY}=${query}`;
    url += `&${URL_Parts.PARAMS.PAGE}=${pageNumber}`;
    url += `&${URL_Parts.PARAMS.PAGE_SIZE}=${config_1.default.RESULTS_PAGE_SIZE}`;
    url += `&${URL_Parts.PARAMS.SORT_MODE}=${URL_Parts.PARAMS.SORT_MODE_VAL}`;
    return url;
};
