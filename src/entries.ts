import { yellow } from 'kleur';

import { IEntry } from './interfaces';
import selectors, { CSS_Selectors } from './selectors';

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

const getAllEntries = (document: HTMLDocument): IEntry[] => {
    let entryDataArr: IEntry[] = [];

    let entryAmount: number = document.querySelectorAll(`${CSS_Selectors.TABLE_CONTAINER} tr`).length;
    
    for (let i = selectors.THeadRow; i < entryAmount; i++) {
        const entrySelector: IEntry = selectors.getEntrySelector(i + 1);
        entryDataArr.push(getEntryData(document, entrySelector));
    }

    return entryDataArr;
}

const getDetails = (entry: IEntry): string[]=> {
    let textArr: string[] = [
        `${yellow().bold('ID')}: ${entry.ID}`,
        `${yellow().bold('Author')}: ${entry.Author}`,
        `${yellow().bold('Title')}: ${entry.Title}`,
        `${yellow().bold('Publisher')}: ${entry.Publisher}`,
        `${yellow().bold('Year')}: ${entry.Year}`,
        `${yellow().bold('Pages')}: ${entry.Pages}`,
        `${yellow().bold('Lang')}: ${entry.Lang}`,
        `${yellow().bold('Size')}: ${entry.Size}`,
        `${yellow().bold('Ext')}: ${entry.Ext}`,
        `${yellow().bold('Mirror')}: ${entry.Mirror}`,
        '---------------------------------------------'
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