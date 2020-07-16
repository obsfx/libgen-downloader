import { Entry } from '../';

import Selectors from './Selectors';

import { ENTRY_DETAILS } from '../outputs';

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
            ENTRY_DETAILS.ID.replace('{ID}', entry.ID),
            ENTRY_DETAILS.Author.replace('{Author}', entry.Author),
            ENTRY_DETAILS.Title.replace('{Title}', entry.Title),
            ENTRY_DETAILS.Publisher.replace('{Publisher}', entry.Publisher),
            ENTRY_DETAILS.Year.replace('{Year}', entry.Year),
            ENTRY_DETAILS.Pages.replace('{Pages}', entry.Pages),
            ENTRY_DETAILS.Lang.replace('{Lang}', entry.Lang),
            ENTRY_DETAILS.Size.replace('{Size}', entry.Size),
            ENTRY_DETAILS.Ext.replace('{Ext}', entry.Ext),
            ENTRY_DETAILS.Mirror.replace('{Mirror}', entry.Mirror),
        ];

        return textArr;
    }

    public static getDownloadURL(document: HTMLDocument): string {
        let downloadURL: string = document.querySelector(Selectors.CSS_SELECTORS.DOWNLOAD_URL)?.getAttribute('href') || ' ';
        return downloadURL;
    }
}
