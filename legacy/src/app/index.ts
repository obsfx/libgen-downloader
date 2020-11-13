import CONFIG from './config';

import { 
    DOWNLOADING,
    NO_RESULT,
    CONNECTION_ERROR,
    BULK,
    LIST,
    SPINNER
} from './outputs';

import ACTIONID from './action-ids';

import {
    UITypes,
    Terminal,
    Spinner,
    EventHandler
} from '../ui';

import Selectors from './modules/Selectors';
import Entries from './modules/Entries';
import BulkDownloader from '../bulk-downloader';

import TitleScene from './scenes/TitleScene';
import BulkQueueScene from './scenes/BulkQueueScene';
import InputScene from './scenes/InputScene';
import ResultsScene from './scenes/ResultsScene';
import EntryDetailsScene from './scenes/EntryDetailsScene';
import AfterDownloadScene from './scenes/AfterDownloadScene';
import SearchAnotherScene from './scenes/SearchAnotherScene';
import DownloadScene from './scenes/DownloadScene';

import fetch, { Response } from 'node-fetch';
import { JSDOM } from 'jsdom';

import { EventEmitter } from 'events';

type AppState = {
    currentPage: number;
    url: string;
    query: string | null;
    queryMinLenWarning: boolean;
    isNextPageExist: boolean;
    errorText: string;
    runtimeError: boolean;
    entryDataArr: Entry[];
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

export default abstract class App {
    public static state: AppState;
    public static spinner: Spinner = new Spinner(); 
    public static bulkQueue: { [key: string]: boolean } = {}
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
    public static createNewAppState(): void {
        this.state = {
            currentPage: 1,
            url: '',
            query: null,
            queryMinLenWarning: false,
            isNextPageExist: false,
            errorText: '',
            runtimeError: false,
            entryDataArr: [],
        }
    }

    public static clear(): void {
        Terminal.clear();
    }

    /**  **************************************************  */
    public static async init(): Promise<void> {
        this.clear();
        this.createNewAppState();

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

    public static initEventHandlers(): void {
        EventHandler.emitKeypressEvents();
        EventHandler.init();

        this.eventEmitter.on(this.events.USER_SELECTED_FROM_LIST, ({ value, actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.PREV_PAGE 
                || actionID == ACTIONID.NEXT_PAGE) {
                this.state.currentPage = (actionID == ACTIONID.NEXT_PAGE) ?
                this.state.currentPage + 1 :
                this.state.currentPage - 1;

                this.clear();
                this.executePromptFlow();
            } else if (actionID == ACTIONID.SEARCH) {
                this.init();
            } else if (actionID == ACTIONID.EXIT) {
                this.exit();
            } else if (actionID == ACTIONID.DOWNLOAD_DIRECTLY) {
                this.promptDownloadProcess(Number(value));
            } else if (actionID == ACTIONID.SEE_DETAILS) {
                this.promptEntryDetails(Number(value));
            } else if (actionID == ACTIONID.START_BULK) {
                this.promptBulkDownloading();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_IN_ENTRY_DETAILS, ({ value, actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.DOWNLOAD_DIRECTLY) {
                this.promptDownloadProcess(Number(value));
            } else if (actionID == ACTIONID.TURN_BACK_TO_THE_LIST) {
                this.promptResults();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_AFTER_DOWNLOAD, ({ actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.TURN_BACK_TO_THE_LIST) {
                this.promptResults();
            } else if (actionID == ACTIONID.EXIT) {
                this.exit();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_SEARCH_ANOTHER, ({ actionID }: UITypes.ReturnObject) => {
            if (actionID == ACTIONID.SEARCH_ANOTHER) {
                this.init();
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
        this.spinner.stop();
        
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

    public static setQuery(query: string): void {
        this.state.query = encodeURIComponent(query);
    }

    private static async setInput(): Promise<void> {
        InputScene.show(this.state.queryMinLenWarning);

        let input: UITypes.ReturnObject = await InputScene.awaitForReturn();

        if (input.value.trim().length < CONFIG.MIN_INPUTLEN) {
            this.state.queryMinLenWarning = true;
        } else {
            this.state.queryMinLenWarning = false;
            this.setQuery(input.value);
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

    private static async promptDownloadProcess(entryIndex: number): Promise<void> {
        DownloadScene.show(Number(entryIndex));

        let filename: string = await DownloadScene.waitForDownloading();

        DownloadScene.hide();

        let title = App.state.runtimeError ? 
            DOWNLOADING.ERR : 
            DOWNLOADING.COMPLETED_FILE.replace('{file}', filename);

        let showDIR: boolean = App.state.runtimeError ?
            false :
            true;

        App.state.runtimeError = false;

        this.promptAfterDownload(title, showDIR);
    }

    public static async promptAfterDownload(title: string, showDIR: boolean = false): Promise<void> {
        AfterDownloadScene.show(1, 5, title, showDIR);

        let selectedChoice: UITypes.ReturnObject = await AfterDownloadScene.awaitForReturn();

        AfterDownloadScene.hide();

        this.eventEmitter.emit(this.events.USER_SELECTED_AFTER_DOWNLOAD, selectedChoice);
    }

    public static async promptSearchAnother(title: string, showDIR: boolean = false): Promise<void> {
        SearchAnotherScene.show(1, 5, title, showDIR);

        let selectedChoice: UITypes.ReturnObject = await SearchAnotherScene.awaitForReturn();

        SearchAnotherScene.hide();

        this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
    }

    public static async promptBulkDownloading(): Promise<void> {
        EventHandler.setResizeCleaning(false);
        this.clear();

        await BulkDownloader.start(Object.keys(this.bulkQueue), 'ID');

        BulkQueueScene.hide();

        this.bulkQueue = {};

        let title: string = BULK.DOWNLOAD_COMPLETED
                    .replace('{completed}',  BulkDownloader.getCompletedItemsCount().toString())
                    .replace('{total}', BulkDownloader.getEntireItemsCount().toString());

        title += `\n${LIST.EXPORT_SUCCESS.replace('{file}', BulkDownloader.getExportedListFileName())}`
        EventHandler.setResizeCleaning(true);
        this.clear();

        this.promptSearchAnother(title, true);
    }

    /**  **************************************************  */
    public static async executePromptFlow(): Promise<void> {
        TitleScene.show();
        this.spinner.setXY(1, 5);
        this.spinner.setSpinnerTitle(SPINNER.GETTING_RESULTS);
        this.spinner.start();

        let connectionSucceed: boolean = false;

        let errTolarance: number = CONFIG.ERR_TOLERANCE;
        let errCounter: number = 0;

        while (errCounter < errTolarance && !connectionSucceed) {
            this.state.runtimeError = false;

            await this.setEntries();

            if (this.state.runtimeError) {
                errCounter++;
                this.spinner.setSpinnerTitle(SPINNER.GETTING_RESULTS_ERR
                    .replace('{errCounter}', errCounter.toString())
                    .replace('{errTolarance}', errTolarance.toString()));
                await this.sleep(CONFIG.ERR_RECONNECT_DELAYMS);
            } else {
                connectionSucceed = true;
            }
        }

        this.spinner.stop();

        if (this.state.runtimeError) {
            this.runtimeError();
        }

        if (this.state.entryDataArr.length > 0) {
            this.promptResults();
        } else {
            this.promptSearchAnother(NO_RESULT);
        }
    }
}
