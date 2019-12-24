import { IEntry } from './interfaces';
import selectors from './selectors';

const querySelectText = (document: HTMLDocument, selector: string) : string => {
    const text = document.querySelector(selector)?.textContent;
    if (!text) return ' ';
    return text;
}

export const getAllEntries = (document: HTMLDocument): Array<IEntry> => {
    const entryArray: IEntry[] = [];
    const entryAmount: number = document.querySelectorAll(`${selectors.container} tr`).length;

    for (let i = 1; i < entryAmount; i++) {
        const entrySelectors: IEntry = selectors.getEntrySelector(i);
        entryArray.push({
            ID: querySelectText(document, entrySelectors.ID),
            Author: querySelectText(document, entrySelectors.Author),
            Title: querySelectText(document, entrySelectors.Title),
            Publisher: querySelectText(document, entrySelectors.Publisher),
            Year: querySelectText(document, entrySelectors.Year),
            Pages: querySelectText(document, entrySelectors.Pages),
            Lang: querySelectText(document, entrySelectors.Lang),
            Size: querySelectText(document, entrySelectors.Size),
            Ext: querySelectText(document, entrySelectors.Ext),
            Mirror: ""
        });
    }
    return entryArray;
}