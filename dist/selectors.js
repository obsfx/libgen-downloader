"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSS_Selectors = {
    TABLE_CONTAINER: '.c tbody',
    DOWNLOAD_URL: '#info h2 a',
    SEARCH_INPUT: '#searchform'
};
const buildCellSelector = (row, col) => {
    return `${exports.CSS_Selectors.TABLE_CONTAINER} tr:nth-child(${row}) td:nth-child(${col})`;
};
const getEntrySelector = (rowOrder) => {
    return {
        ID: buildCellSelector(rowOrder, 1 /* ID */),
        Author: buildCellSelector(rowOrder, 2 /* Author */),
        Title: buildCellSelector(rowOrder, 3 /* Title */),
        Publisher: buildCellSelector(rowOrder, 4 /* Publisher */),
        Year: buildCellSelector(rowOrder, 5 /* Year */),
        Pages: buildCellSelector(rowOrder, 6 /* Pages */),
        Lang: buildCellSelector(rowOrder, 7 /* Lang */),
        Size: buildCellSelector(rowOrder, 8 /* Size */),
        Ext: buildCellSelector(rowOrder, 9 /* Ext */),
        Mirror: `${buildCellSelector(rowOrder, 10 /* Mirror */)} a`,
    };
};
const THeadRow = 1;
const THeads = getEntrySelector(THeadRow);
exports.default = {
    THeadRow,
    THeads,
    getEntrySelector
};
