/*
 * TODO: Create 'abstract screen classes' for every ui screen
 * of app.
 *
 * Create ui-templates.ts
 */


import { Interfaces } from './interfaces.namespace';

import CONFIG from './config';
import CONSTANTS from './constants';

import {
    UIInterfaces,

    Terminal,

    List,
    DropdownList,

    Input,

    UIConstants
} from '../ui';

import UIObjects from './modules/UIObjects';
import Selectors from './modules/Selectors';
import Entries from './modules/Entries';
import Downloader from './modules/Downloader';
import BulkDownloader from '../bulk-downloader';

import CategoryScene from'./scenes/CategoryScene';
import InputScene from './scenes/InputScene';
import ResultsScene from './scenes/ResultsScene';

import fetch, { Response } from 'node-fetch';
import { Spinner } from 'cli-spinner';
import { JSDOM } from 'jsdom';

import { EventEmitter } from 'events';

export default abstract class App {
    public static state: Interfaces.AppState;
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
    private static createNewAppState(): Interfaces.AppState {
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
            listObject: null
        }
    }

    public static clear(): void {
        Terminal.clear();
        this.promptHead();
    }

    private static promptHead(): void {
        CONSTANTS.HEAD.forEach(line => console.log(line));
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
        this.eventEmitter.on(this.events.USER_SELECTED_FROM_LIST, async ({ value, actionID }: UIInterfaces.ReturnObject) => {
            if (actionID == CONSTANTS.PAGINATIONS.PREV_PAGE_RESULT_VAL 
                || actionID == CONSTANTS.PAGINATIONS.NEXT_PAGE_RESULT_VAL) {
                this.state.currentPage = (actionID == CONSTANTS.PAGINATIONS.NEXT_PAGE_RESULT_VAL) ?
                this.state.currentPage + 1 :
                this.state.currentPage - 1;
                
                this.clear();
                await this.executePromptFlow();
            } else if (actionID == CONSTANTS.PAGINATIONS.SEARCH_RESULT_ID) {
                await this.init();
            } else if (actionID == CONSTANTS.EXIT.EXIT_RESULT_ID) {
                this.exit();
            } else if (actionID == CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD_RES_VAL) {
                await this.download(Number(value));
            } else if (actionID == CONSTANTS.SEE_DETAILS_LISTING.SEE_DETAILS_RES_VAL) {
                await this.promptEntryDetails(Number(value));
            } else if (actionID == UIConstants.DOWNLOADBULKVAL) {
                this.clear();
                
               // await BulkDownloader.Main.start(Object.keys(UI.Terminal.getCheckedListings()), 'ID');

               // UI.Terminal.resetCheckedListings();

                console.log(CONSTANTS.BULK_DOWNLOAD_COMPLETED, 
                    BulkDownloader.Main.getCompletedItemsCount(), BulkDownloader.Main.getEntireItemsCount());

                App.promptAfterDownload();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_IN_ENTRY_DETAILS, async ({ value, actionID }: UIInterfaces.ReturnObject) => {
            if (actionID == CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD_RES_VAL) {
                await this.download(Number(value));
            } else if (actionID == CONSTANTS.ENTRY_DETAILS_CHECK.ENTRY_DETAILS_CHECK_RES_VAL) {
                let entry: Interfaces.Entry = this.state.entryDataArr[Number(value)];

               // UI.Terminal.toggleCheckHashMap(entry.ID);

                await this.promptEntryDetails(Number(value));
            } else if (actionID == CONSTANTS.TURN_BACK_LISTING.TURN_BACK_RESULT_ID) {
                await this.promptResults();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_AFTER_DOWNLOAD, async ({ value, actionID }: UIInterfaces.ReturnObject) => {
            if (actionID == CONSTANTS.TURN_BACK_LISTING.TURN_BACK_RESULT_ID) {
                await this.promptResults();
            } else if (actionID == CONSTANTS.EXIT.EXIT_RESULT_ID){
                this.exit();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_SEARCH_ANOTHER, async ({ value, actionID }: UIInterfaces.ReturnObject) => {
            if (actionID == CONSTANTS.SEARCH_ANOTHER_LISTINGS.SEARCH_ANOTHER_RESULT_ID) {
                await this.init();
            } else if (actionID == CONSTANTS.EXIT.EXIT_RESULT_ID) {
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

   // private static constructOptions(): UIInterfaces.ListingObject[] {
   //     let listings: UIInterfaces.ListingObject[] = [];

   //     listings.push(UIObjects.getOptionListingObject(
   //         CONSTANTS.PAGINATIONS.SEARCH,
   //         CONSTANTS.PAGINATIONS.SEARCH_RESULT_ID
   //     ));

   //     if (this.state.isNextPageExist) {
   //         let nextPageURL: string = this.constructURL(this.state.currentPage + 1);
   //         
   //         listings.push(UIObjects.getOptionListingObject(
   //             CONSTANTS.PAGINATIONS.NEXT_PAGE,
   //             CONSTANTS.PAGINATIONS.NEXT_PAGE_RESULT_VAL,
   //             nextPageURL
   //         ));
   //     }

   //     if (this.state.currentPage > 1) {
   //         let prevPageURL: string = this.constructURL(this.state.currentPage - 1);

   //         listings.push(UIObjects.getOptionListingObject(
   //             CONSTANTS.PAGINATIONS.PREV_PAGE,
   //             CONSTANTS.PAGINATIONS.PREV_PAGE_RESULT_VAL,
   //             prevPageURL
   //         ));
   //     }

   //     listings.push(UIObjects.getOptionListingObject(
   //         CONSTANTS.EXIT.EXIT,
   //         CONSTANTS.EXIT.EXIT_RESULT_ID
   //     ));

   //     return listings;
   // }

    public static async runtimeError(): Promise<void> {
   //     if (this.spinner.isSpinning()) {
   //         this.spinner.stop(true);
   //     }

   //     UI.Terminal.prevLine();
   //     UI.Terminal.clearLine();

   //     console.log(CONSTANTS.CONNECTION_ERROR);

   //     let searchAnotherObject: UIInterfaces.ListObject = UIObjects.getSearchAnotherListObject();
   //     let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(searchAnotherObject);
   //     this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
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

    private static async isNextPageExist(): Promise<boolean> {
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
        
        let category: UIInterfaces.ReturnObject = await CategoryScene.awaitForReturn();
        
        this.state.category = category.value; 

        CategoryScene.hide();
    }

    private static async setInput(): Promise<void> {
        if (this.state.queryMinLenWarning) {
            console.log(this.state.queryMinLenWarning ? CONSTANTS.INPUT_MINLEN_WARNING : ' ');
            this.state.queryMinLenWarning = false;
        }  

        InputScene.show();

        let input: UIInterfaces.ReturnObject = await InputScene.awaitForReturn();

        if (input.value.trim().length < CONFIG.MIN_INPUTLEN) {
            this.state.queryMinLenWarning = true;
        } else {
            this.state.query = encodeURIComponent(input.value);
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
    
            let entryData: Interfaces.Entry[] = Entries.getAllEntries(document);
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
    private static async download(entryIndex: number): Promise<void> {
        let entryID: string = this.state.entryDataArr[entryIndex].ID;
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

        console.log(CONSTANTS.DOWNLOAD_COMPLETED, fileName);

        App.promptAfterDownload();
    }

    /**  **************************************************  */
    private static async promptResults(): Promise<void> {
        this.clear();

        ResultsScene.show(this.state.entryDataArr);

        let k = await ResultsScene.awaitForReturn();
        
        console.log(k);

       // let listObject: UIInterfaces.ListObject = UIObjects.getListObject(this.state.entryDataArr, this.state.currentPage);
       // let optionObjects: UIInterfaces.ListingObject[] = this.constructOptions();

       // if (optionObjects.length > 0) {
       //     listObject.listings = [...optionObjects, ...listObject.listings];
       // }

       // this.state.listObject = listObject;

       // console.log(CONSTANTS.RESULTS_TITLE
       //     .replace('{query}', decodeURIComponent(this.state.query || '') || ' ')
       //     .replace('{page}', this.state.currentPage.toString()));

       // UI.Terminal.setBulkDownloadOptionPosition(optionObjects.length);
       // 
       // let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(this.state.listObject);

       // this.eventEmitter.emit(this.events.USER_SELECTED_FROM_LIST, selectedChoice);
    }

    private static async promptEntryDetails(entryIndex: number): Promise<void> {
       // this.clear();

       // let selectedEntry: Interfaces.Entry = this.state.entryDataArr[entryIndex];
       // let outputArr: string[] = Entries.getDetails(selectedEntry);

       // outputArr.forEach(output => console.log(output));

       // let entryCheckStatus: boolean = UI.Terminal.isListingChecked(selectedEntry.ID);

       // let detailsListObject: UIInterfaces.ListObject = UIObjects.getEntryDetailsListObject(entryIndex, entryCheckStatus);

       // let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(detailsListObject);

       // this.eventEmitter.emit(this.events.USER_SELECTED_IN_ENTRY_DETAILS, selectedChoice);
    }

    public static async promptAfterDownload(): Promise<void> {
       // let afterDownloadListObject: UIInterfaces.ListObject = UIObjects.getAfterDownloadListObject();

       // let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(afterDownloadListObject);

       // this.eventEmitter.emit(this.events.USER_SELECTED_AFTER_DOWNLOAD, selectedChoice);
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
      //      UI.Terminal.prevLine();
      //      UI.Terminal.clearLine();

      //      console.log(CONSTANTS.NO_RESULT);

      //      let searchAnotherObject: UIInterfaces.ListObject = UIObjects.getSearchAnotherListObject();
      //      let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(searchAnotherObject);
      //      this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
        }
    }
}
