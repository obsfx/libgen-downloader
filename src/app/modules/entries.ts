import { Interfaces } from '../interfaces.namespace';

import Selectors from './selectors';
import CONSTANTS from '../constants';

const querySelectText = (document: HTMLDocument, selector: string): string => {
    let text: string | undefined | null = document.querySelector(selector)?.textContent;
    return (text) ? text : ' ';
}

const getEntryData = (document: HTMLDocument, entrySelector: Interfaces.Entry): Interfaces.Entry => {
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

const getAllEntries = (document: HTMLDocument): Interfaces.Entry[] => {
    let entryDataArr: Interfaces.Entry[] = [];

    let entryAmount: number = document.querySelectorAll(Selectors.CSS_SELECTORS.ROW).length;
    
    for (let i = Selectors.THeadRow; i < entryAmount; i++) {
        const entrySelector: Interfaces.Entry = Selectors.getEntrySelector(i + 1);
        entryDataArr.push(getEntryData(document, entrySelector));
    }

    return entryDataArr;
}

const getDetails = (entry: Interfaces.Entry): string[] => {
    let textArr: string[] = [
        `${CONSTANTS.ENTRY_DETAILS_HEAD.ID}: ${entry.ID}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Author}: ${entry.Author}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Title}: ${entry.Title}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Publisher}: ${entry.Publisher}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Year}: ${entry.Year}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Pages}: ${entry.Pages}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Lang}: ${entry.Lang}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Size}: ${entry.Size}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Ext}: ${entry.Ext}`,
        `${CONSTANTS.ENTRY_DETAILS_HEAD.Mirror}: ${entry.Mirror}`,
        ' '
    ];

    return textArr;
}

const getDownloadURL = (document: HTMLDocument): string => {
    let downloadURL: string = document.querySelector(Selectors.CSS_SELECTORS.DOWNLOAD_URL)?.getAttribute('href') || ' ';
    return downloadURL;
}

export default {
    getAllEntries,
    getDetails,
    getDownloadURL
}