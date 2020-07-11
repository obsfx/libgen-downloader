/*
 * TODO:
 *
 * [] spinner
 * [x] add pagination
 * [] entry details
 * [x] entry details listing
 * [] comics selectors
 * [] fiction selectors
 */

import CONFIG from './config';
import CONSTANTS from './constants';
import { 
    DOWNLOAD_COMPLETED,
    NO_RESULT,
    CONNECTION_ERROR,
    DOWNLOAD_COMPLETED_FILE
} from './outputs';

import ACTIONID from './action-ids';

import {
    UITypes,
    Terminal,
    UIConstants
} from '../ui';

import Selectors from './modules/Selectors';
import Entries from './modules/Entries';
import Downloader from './modules/Downloader';
import BulkDownloader from '../bulk-downloader';

import CategoryScene from'./scenes/CategoryScene';
import InputScene from './scenes/InputScene';
import ResultsScene from './scenes/ResultsScene';
import EntryDetailsScene from './scenes/EntryDetailsScene';
import SearchAnotherScene from './scenes/SearchAnotherScene';

import fetch, { Response } from 'node-fetch';
import { Spinner } from 'cli-spinner';
import { JSDOM } from 'jsdom';

import { EventEmitter } from 'events';

type AppState = {
    currentPage: number;
    url: string;
    category: string | null;
    query: string | null;
    queryMinLenWarning: boolean;
    isNextPageExist: boolean;
    errorText: string;
    runtimeError: boolean;
    entryDataArr: Entry[];
    bulkQueue: { [key: string]: boolean };
}

export type Entry = {
    ID: string;
    Author: string;
    Title: string;
    Publisher: string;
    Year: string;
    Pages: string;
    Lang: string;
    Size: string;
    Ext: string;
    Mirror: string;
}

type EntryData = {
    md5: string;
    title: string;
    author: string;
    extension: string;
}

export default abstract class App {
    public static state: AppState;
    public static spinner: Spinner = new Spinner(); 
    private static eventEmitter: EventEmitter = new EventEmitter();

    private static events: {
        [key: string]: string
    } = {
        USER_SELECTED_FROM_LIST: 'user_selected_from_list',
        USER_SELECTED_IN_ENTRY_DETAILS: 'user_selected_in_entry_details',
        USER_SELECTED_AFTER_DOWNLOAD: 'user_selected_after_download',
        USER_SELECTED_SEARCH_ANOTHER: 'user_selected_search_another'
    }

    /**  **************************************************  */
    private static createNewAppState(): AppState {
        return {
            currentPage: 1,
            url: '',
            category: null,
            query: null,
            queryMinLenWarning: false,
            isNextPageExist: false,
            errorText: '',
            runtimeError: false,
            entryDataArr: [],
            bulkQueue: {}
        }
    }

    public static clear(): void {
        Terminal.clear();
    }

    /**  **************************************************  */
    public static async init(fileReadMode: boolean = false): Promise<void> {
        this.clear();
        this.state = this.createNewAppState();

        if (fileReadMode) {
            return;
        }

        await this.setCategory();

        while (this.state.query == null) {
            await this.setInput();
            this.clear();
        }

        await this.executePromptFlow();
    }

    public static exit(): void {
        Terminal.showCursor();
        process.exit(0);
    }

    public static async initEventHandlers(): Promise<void> {
        this.eventEmitter.on(this.events.USER_SELECTED_FROM_LIST, async ({ value, actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.PREV_PAGE 
                || actionID == ACTIONID.NEXT_PAGE) {
                this.state.currentPage = (actionID == ACTIONID.NEXT_PAGE) ?
                this.state.currentPage + 1 :
                this.state.currentPage - 1;
                
                this.clear();
                await this.executePromptFlow();
            } else if (actionID == ACTIONID.SEARCH) {
                await this.init();
            } else if (actionID == ACTIONID.EXIT) {
                this.exit();
            } else if (actionID == ACTIONID.DOWNLOAD_DIRECTLY) {
                await this.download(value);
            } else if (actionID == ACTIONID.SEE_DETAILS) {
                await this.promptEntryDetails(Number(value));
            } else if (actionID == ACTIONID.START_BULK) {
                this.clear();

                await BulkDownloader.Main.start(Object.keys(this.state.bulkQueue), 'ID');

                this.state.bulkQueue = {};

               // console.log(CONSTANTS.BULK_DOWNLOAD_COMPLETED, 
               // BulkDownloader.Main.getCompletedItemsCount(), BulkDownloader.Main.getEntireItemsCount());

                this.promptAfterDownload();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_IN_ENTRY_DETAILS, async ({ value, actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.DOWNLOAD_DIRECTLY) {
                await this.download(value);
            } else if (actionID == ACTIONID.TURN_BACK_TO_THE_LIST) {
                await this.promptResults();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_AFTER_DOWNLOAD, async ({ value, actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.TURN_BACK_TO_THE_LIST) {
                await this.promptResults();
            } else if (actionID == ACTIONID.EXIT) {
                this.exit();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_SEARCH_ANOTHER, async ({ value, actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.SEARCH_ANOTHER) {
                await this.init();
            } else if (actionID == ACTIONID.EXIT) {
                this.exit();
            }
        });
    }

    private static constructURL(pageNumber: number): string {
        let url: string = CONFIG.MIRROR;

        url += `${CONFIG.URL_PARTS.SEARCH_PAGE}?`;

        url += `&${CONFIG.URL_PARTS.PARAMS.QUERY}=${this.state.query}`;
        url += `&${CONFIG.URL_PARTS.PARAMS.PAGE}=${pageNumber}`;
        url += `&${CONFIG.URL_PARTS.PARAMS.PAGE_SIZE}=${CONFIG.RESULTS_PAGE_SIZE}`
        url += `&${CONFIG.URL_PARTS.PARAMS.SORT_MODE}=${CONFIG.URL_PARTS.PARAMS.SORT_MODE_VAL}`;

        return url;
    }

    public static async runtimeError(): Promise<void> {
        if (this.spinner.isSpinning()) {
            this.spinner.stop(true);
        }
        SearchAnotherScene.show(1, 5, CONNECTION_ERROR);

        let selectedChoice: UITypes.ReturnObject = await SearchAnotherScene.awaitForReturn();

        SearchAnotherScene.hide();

        this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
    }

    /**  **************************************************  */
    public static sleep(ms: number): Promise<void> {
        return new Promise((resolve: Function) => {
            setTimeout(() => { resolve() }, ms);
        });
    }
    
    private static isSearchInputExistInDocument(document: HTMLDocument): boolean {
        const searchInput = document.querySelector(Selectors.CSS_SELECTORS.SEARCH_INPUT);
        return (searchInput) ? true : false;
    }

    public static async isNextPageExist(): Promise<boolean> {
        let nextPageURL: string = this.constructURL(this.state.currentPage + 1);
        let document: HTMLDocument | void = await this.getDocument(nextPageURL);

        let entryAmount: number = 0;

        if (document) {
            entryAmount = document.querySelectorAll(Selectors.CSS_SELECTORS.ROW).length;
        }

        return (entryAmount > 1) ? true : false;
    }

    /**  **************************************************  */
    private static async setCategory(): Promise<void> {
        CategoryScene.show();
        
        let category: UITypes.ReturnObject = await CategoryScene.awaitForReturn();
        
        this.state.category = category.value; 

        CategoryScene.hide();
    }

    private static async setInput(): Promise<void> {
        InputScene.show(this.state.category || '', this.state.queryMinLenWarning);

        let input: UITypes.ReturnObject = await InputScene.awaitForReturn();

        if (input.value.trim().length < CONFIG.MIN_INPUTLEN) {
            this.state.queryMinLenWarning = true;
        } else {
            this.state.queryMinLenWarning = false;
            this.state.query = encodeURIComponent(input.value);

            InputScene.hide();
        }
    }

    private static async setEntries(): Promise<void> {
        this.state.url = this.constructURL(this.state.currentPage);
        let document: HTMLDocument | void = await this.getDocument(this.state.url);

        if (document) {
            if (!this.isSearchInputExistInDocument(document)) {
                this.state.runtimeError = true;
                return;
            }

            this.state.isNextPageExist = await this.isNextPageExist();

            if (this.state.runtimeError) {
                return;
            }
    
            let entryData: Entry[] = Entries.getAllEntries(document);
            this.state.entryDataArr = entryData;
        }
    }

    /**  **************************************************  */
    public static async getResponse(url: string): Promise<Response> {
        let response: Response = new Response();

        try {
            response = await fetch(url);
        } catch(error) {
            this.state.runtimeError = true;
            this.state.errorText = error;
        }

        return response;
    }

    public static async getDocument(url: string): Promise<HTMLDocument | void> {
        let response: Response = await this.getResponse(url) || new Response();

        if (this.state.runtimeError) {
            return;
        }

        let plainText: string = await response.text();

        return new JSDOM(plainText).window.document;
    }

    /**  **************************************************  */
    private static async download(entryID: string): Promise<void> {
        let entryMD5Arr: { md5: string }[] | void = await Downloader.findEntriesMD5([entryID]);

        let URL: string = '';

        if (this.state.runtimeError) {
            return;
        }

        if (entryMD5Arr) {
            URL = await Downloader.findDownloadURL(entryMD5Arr[0].md5);
        }

        if  (this.state.runtimeError) {
            return;
        }

        let fileName: string = await Downloader.startDownloading(URL);

        if (App.state.runtimeError) {
            this.runtimeError();
            return;
        }

        console.log(DOWNLOAD_COMPLETED_FILE, fileName);

        this.promptAfterDownload();
    }

    /**  **************************************************  */
    private static async promptResults(): Promise<void> {
        this.clear();

        ResultsScene.show();

        let selectedChoice: UITypes.ReturnObject = await ResultsScene.awaitForReturn();

        ResultsScene.hide();

        this.eventEmitter.emit(this.events.USER_SELECTED_FROM_LIST, selectedChoice);
    }

    private static async promptEntryDetails(entryIndex: number): Promise<void> {
        this.clear();

        EntryDetailsScene.show(entryIndex);

        let selectedChoice: UITypes.ReturnObject = await EntryDetailsScene.awaitForReturn();

        EntryDetailsScene.hide();

        this.eventEmitter.emit(this.events.USER_SELECTED_IN_ENTRY_DETAILS, selectedChoice);
    }

    public static async promptAfterDownload(): Promise<void> {
        SearchAnotherScene.show(1, 5, DOWNLOAD_COMPLETED);

        let selectedChoice: UITypes.ReturnObject = await SearchAnotherScene.awaitForReturn();

        SearchAnotherScene.hide();

        this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
    }

    /**  **************************************************  */
    private static async executePromptFlow(): Promise<void> {
        this.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_RESULTS);
        this.spinner.start();

        let connectionSucceed: boolean = false;

        let errTolarance: number = CONFIG.ERR_TOLERANCE;
        let errCounter: number = 0;

        while (errCounter < errTolarance && !connectionSucceed) {
            this.state.runtimeError = false;

            await this.setEntries();

            if (this.state.runtimeError) {
                errCounter++;
                this.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_RESULTS_ERR
                    .replace('{errCounter}', errCounter.toString())
                    .replace('{errTolarance}', errTolarance.toString()));
                await this.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
            } else {
                connectionSucceed = true;
            }
        }

        this.spinner.stop(true);

        if (this.state.runtimeError) {
            this.runtimeError();
            return;
        }

        if (this.state.entryDataArr.length > 0) {
            this.promptResults();
        } else {
            SearchAnotherScene.show(1, 5, NO_RESULT);

            let selectedChoice: UITypes.ReturnObject = await SearchAnotherScene.awaitForReturn();

            SearchAnotherScene.hide();

            this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
        }
    }
}
