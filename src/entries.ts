import { IEntry } from './interfaces';
import selectors, { CSS_Selectors } from './selectors';
import config from './config';

const querySelectText = (document: HTMLDocument, selector: string): string => {
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

const getAllEntries = (document: HTMLDocument): { isNextPageExist: boolean, entiries: IEntry[] } => {
    let isNextPageExist: boolean = false;
    let entiries: IEntry[] = [];

    let entryAmount: number = document.querySelectorAll(`${CSS_Selectors.TABLE_CONTAINER} tr`).length;
    
    if (entryAmount - 1 > config.RESULTS_PAGE_SIZE) {
        isNextPageExist = true;
    }

    for (let i = selectors.THeadRow; i < entryAmount; i++) {
        const entrySelector: IEntry = selectors.getEntrySelector(i + 1);
        entiries.push(getEntryData(document, entrySelector));
    }

    return { isNextPageExist, entiries };
}

const showEntry = (entry: IEntry) => {
    let textArr: string[] = [
        `ID: ${entry.ID}`,
        `Author: ${entry.Author}`,
        `Title: ${entry.Title}`,
        `Publisher: ${entry.Publisher}`,
        `Year: ${entry.Year}`,
        `Pages: ${entry.Pages}`,
        `Lang: ${entry.Lang}`,
        `Size: ${entry.Size}`,
        `Ext: ${entry.Ext}`
    ];

    textArr.forEach(text => console.log(text));
}

export default {
    getAllEntries,
    showEntry
}