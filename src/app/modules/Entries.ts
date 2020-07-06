import { Entry } from '../App';

import Selectors from './Selectors';
import CONSTANTS from '../constants';


export default abstract class Entries {
    public static querySelectText(document: HTMLDocument, selector: string): string {
        let text: string | undefined | null = document.querySelector(selector)?.textContent;
        return (text) ? text : ' ';
    }

    public static getEntryData(document: HTMLDocument, entrySelector: Entry): Entry {
        return {
            ID: this.querySelectText(document, entrySelector.ID),
            Author: this.querySelectText(document, entrySelector.Author),
            Title: this.querySelectText(document, entrySelector.Title),
            Publisher: this.querySelectText(document, entrySelector.Publisher),
            Year: this.querySelectText(document, entrySelector.Year),
            Pages: this.querySelectText(document, entrySelector.Pages),
            Lang: this.querySelectText(document, entrySelector.Lang),
            Size: this.querySelectText(document, entrySelector.Size),
            Ext: this.querySelectText(document, entrySelector.Ext),
            Mirror: document.querySelector(entrySelector.Mirror)?.getAttribute('href') || ' '
        }
    }

    public static getAllEntries(document: HTMLDocument): Entry[] {
        let entryDataArr: Entry[] = [];

        let entryAmount: number = document.querySelectorAll(Selectors.CSS_SELECTORS.ROW).length;
        
        for (let i = Selectors.THeadRow; i < entryAmount; i++) {
            const entrySelector: Entry = Selectors.getEntrySelector(i + 1);
            entryDataArr.push(this.getEntryData(document, entrySelector));
        }

        return entryDataArr;
    }

    public static getDetails(entry: Entry): string[] {
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

    public static getDownloadURL(document: HTMLDocument): string {
        let downloadURL: string = document.querySelector(Selectors.CSS_SELECTORS.DOWNLOAD_URL)?.getAttribute('href') || ' ';
        return downloadURL;
    }
}
