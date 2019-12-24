const enum TColumns {
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

const container: string = '.c tbody';

const THeadContainer: string = 'tr:nth-child(1)';
const THeadPrefix: string = `${container} ${THeadContainer}`;

interface ITHeads {
    ID: string;
    Author: string;
    Title: string;
    Publisher: string;
    Year: string;
    Pages: string;
    Lang: string;
    Size: string;
    Ext: string;
    Mirror: string;
}

const THeads: ITHeads = {
    ID: `${THeadPrefix} td:nth-child(${TColumns.ID})`,
    Author: `${THeadPrefix} td:nth-child(${TColumns.Author})`,
    Title: `${THeadPrefix} td:nth-child(${TColumns.Title})`,
    Publisher: `${THeadPrefix} td:nth-child(${TColumns.Publisher})`,
    Year: `${THeadPrefix} td:nth-child(${TColumns.Year})`,
    Pages: `${THeadPrefix} td:nth-child(${TColumns.Pages})`,
    Lang: `${THeadPrefix} td:nth-child(${TColumns.Lang})`,
    Size: `${THeadPrefix} td:nth-child(${TColumns.Size})`,
    Ext: `${THeadPrefix} td:nth-child(${TColumns.Ext})`,
    Mirror: `${THeadPrefix} td:nth-child(${TColumns.Mirror})`
}

export default {
    THeads
}