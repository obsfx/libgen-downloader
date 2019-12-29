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
        Mirror: document.querySelector(entrySelector.Mirror)?.getAttribute('href') || ' '
    }
}

const getAllEntries = (document: HTMLDocument): { isNextPageExist: boolean, entryDataArr: IEntry[] } => {
    let isNextPageExist: boolean = false;
    let entryDataArr: IEntry[] = [];

    let entryAmount: number = document.querySelectorAll(`${CSS_Selectors.TABLE_CONTAINER} tr`).length;
    
    if (entryAmount - 1 > config.RESULTS_PAGE_SIZE) {
        isNextPageExist = true;
    }

    for (let i = selectors.THeadRow; i < entryAmount; i++) {
        const entrySelector: IEntry = selectors.getEntrySelector(i + 1);
        entryDataArr.push(getEntryData(document, entrySelector));
    }

    return { isNextPageExist, entryDataArr };
}

const getDetails = (entry: IEntry): string[]=> {
    let textArr: string[] = [
        `ID: ${entry.ID}`,
        `Author: ${entry.Author}`,
        `Title: ${entry.Title}`,
        `Publisher: ${entry.Publisher}`,
        `Year: ${entry.Year}`,
        `Pages: ${entry.Pages}`,
        `Lang: ${entry.Lang}`,
        `Size: ${entry.Size}`,
        `Ext: ${entry.Ext}`,
        `Mirror: ${entry.Mirror}`
    ];

    return textArr;
}

const getDownloadURL = (document: HTMLDocument): string => {
    let downloadURL: string = document.querySelector('#info h2 a')?.getAttribute('href') || ' ';
    return downloadURL;
}

export default {
    getAllEntries,
    getDetails,
    getDownloadURL
}