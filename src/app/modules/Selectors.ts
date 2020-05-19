import { Interfaces } from '../interfaces.namespace';

// const THeads: Interfaces.Entry = getEntrySelector(THeadRow);

export default abstract class Selectors {
    public static THeadRow: number = 1;

    public static CSS_SELECTORS: {
        [key: string]: string
    } = {
        TABLE_CONTAINER: '.c tbody',
        ROW: `.c tbody tr`,
        DOWNLOAD_URL: '#info h2 a',
        SEARCH_INPUT: '#searchform'
    }

    private static TSections: {
        [key: string]: number
    } = {
        ID: 1,
        Author: 2,
        Title: 3,
        Publisher: 4,
        Year: 5,
        Pages: 6,
        Lang: 7,
        Size: 8,
        Ext: 9,
        Mirror: 10
    }

    private static buildCellSelector (row: number, col: number): string {
        return `${this.CSS_SELECTORS.TABLE_CONTAINER} tr:nth-child(${row}) td:nth-child(${col})`;
    }
    
    public static getEntrySelector(rowOrder: number): Interfaces.Entry {
        return {
            ID: this.buildCellSelector(rowOrder, this.TSections.ID),
            Author: this.buildCellSelector(rowOrder, this.TSections.Author),
            Title: this.buildCellSelector(rowOrder, this.TSections.Title),
            Publisher: this.buildCellSelector(rowOrder, this.TSections.Publisher),
            Year: this.buildCellSelector(rowOrder, this.TSections.Year),
            Pages: this.buildCellSelector(rowOrder, this.TSections.Pages),
            Lang: this.buildCellSelector(rowOrder, this.TSections.Lang),
            Size: this.buildCellSelector(rowOrder, this.TSections.Size),
            Ext: this.buildCellSelector(rowOrder, this.TSections.Ext),
            Mirror: `${this.buildCellSelector(rowOrder, this.TSections.Mirror)} a`,
        }
    }
}
