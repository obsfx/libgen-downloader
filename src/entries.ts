import { IEntry } from './interfaces';
import selectors, { CSS_Selectors } from './selectors';

const querySelectText = (document: HTMLDocument, selector: string) : string => {
    let text = document.querySelector(selector)?.textContent;
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

export const getAllEntries = (document: HTMLDocument): {pagination: boolean, entiries: IEntry[]} => {
    let pagination: boolean = false;
    let entiries: IEntry[] = [];

    let entryAmount: number = document.querySelectorAll(`${CSS_Selectors.TABLE_CONTAINER} tr`).length;
    
    if (entryAmount - 1 > 25) {
        pagination = true;
    }

    for (let i = selectors.THeadRow; i < 26; i++) {
        const entrySelector: IEntry = selectors.getEntrySelector(i + 1);
        entiries.push(getEntryData(document, entrySelector));
    }

    return { pagination, entiries };
}