import { Interfaces } from '../interfaces.namespace';

const CSS_SELECTORS = {
    TABLE_CONTAINER: '.c tbody',
    ROW: `.c tbody tr`,
    DOWNLOAD_URL: '#info h2 a',
    SEARCH_INPUT: '#searchform'
}

const enum TSections {
    ID = 1,
    Author = 2,
    Title = 3,
    Publisher = 4,
    Year = 5,
    Pages = 6,
    Lang = 7,
    Size = 8,
    Ext = 9,
    Mirror = 10
}

const buildCellSelector = (row: number, col: number): string => {
    return `${CSS_SELECTORS.TABLE_CONTAINER} tr:nth-child(${row}) td:nth-child(${col})`;
}

const getEntrySelector = (rowOrder: number): Interfaces.Entry => {
    return {
        ID: buildCellSelector(rowOrder, TSections.ID),
        Author: buildCellSelector(rowOrder, TSections.Author),
        Title: buildCellSelector(rowOrder, TSections.Title),
        Publisher: buildCellSelector(rowOrder, TSections.Publisher),
        Year: buildCellSelector(rowOrder, TSections.Year),
        Pages: buildCellSelector(rowOrder, TSections.Pages),
        Lang: buildCellSelector(rowOrder, TSections.Lang),
        Size: buildCellSelector(rowOrder, TSections.Size),
        Ext: buildCellSelector(rowOrder, TSections.Ext),
        Mirror: `${buildCellSelector(rowOrder, TSections.Mirror)} a`,
    }
}

const THeadRow = 1;
const THeads: Interfaces.Entry = getEntrySelector(THeadRow);

export default {
    CSS_SELECTORS,
    THeadRow,
    getEntrySelector
}