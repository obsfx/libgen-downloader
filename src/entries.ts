import { IEntry } from './interfaces';
import selectors from './selectors';

const querySelectText = (document: HTMLDocument, selector: string) : string => {
    const text = document.querySelector(selector)?.textContent;
    if (!text) return ' ';
    return text;
}

const getEntryData = (document: HTMLDocument, entrySelector: IEntry): IEntry => {
    return {
        ID: querySelectText(document, entrySelector.ID),
        Author: querySelectText(document, entrySelector.Author),
        Title: querySelectText(document, entrySelector.Title),
        Publisher: querySelectText(document, entrySelector.Publisher),
        Year: querySelectText(document, entrySelector.Year),
        Pages: querySelectText(document, entrySelector.Pages),
        Lang: querySelectText(document, entrySelector.Lang),
        Size: querySelectText(document, entrySelector.Size),
        Ext: querySelectText(document, entrySelector.Ext),
        Mirror: ""
    }
}

export const getAllEntries = (document: HTMLDocument): Array<IEntry> => {
    const entryArray: IEntry[] = [];
    const entryAmount: number = document.querySelectorAll(`${selectors.container} tr`).length;

    for (let i = 1; i < entryAmount; i++) {
        const entrySelector: IEntry = selectors.getEntrySelector(i);
        entryArray.push(getEntryData(document, entrySelector));
    }
    return entryArray;
}