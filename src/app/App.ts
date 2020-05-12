// DIST FOLDER NAME WILL BE CHANGED TO 'DEV' IN PACKAGE.JSON
// Make the tests of connection error cases
// Add 'See Bulk Download Queue' option to results list
// Implement download functionlity
// bulk download screen 
// --md5file=file.txt and idfile=file.txt command line parameter
// libgen downloader --md5=md5 output -> download url commandline parameter
// user also can download via id 
// add try again option for connection failure

import { Interfaces } from './interfaces.namespace';
import { UIInterfaces } from '../ui';

import CONFIG from './config';
import CONSTANTS from './constants';

import UI from '../ui';
import UIObjects from './modules/UIObjects';
import Selectors from './modules/selectors';
import Entries from './modules/entries';

import fetch, { Response } from 'node-fetch';
import ProgressBar from 'progress';
import { Spinner } from 'cli-spinner';
import { JSDOM } from 'jsdom';

import { EventEmitter } from 'events';
import fs from 'fs';

export default abstract class App {
    private static state: Interfaces.AppState;
    private static spinner: Spinner = new Spinner();
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
            query: null,
            isNextPageExist: false,
            errorText: '',
            connectionError: false,
            entryDataArr: [],
            listObject: null
        }
    }

    private static clear(): void {
        // readline.cursorTo(process.stdout, 0, 0);
        // readline.clearScreenDown(process.stdout);
        UI.Terminal.clear();
        this.promptHead();
    }

    private static promptHead(): void {
        CONSTANTS.HEAD.forEach(line => console.log(line));
    }

    /**  **************************************************  */
    public static async init(): Promise<void> {
        this.clear();
        this.state = this.createNewAppState();

        while (this.state.query == null) {
            await this.setInput();
        }
    
        await this.executePromptFlow();
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
                // ASK TO USER
                UI.Terminal.showCursor();
                process.exit(0);
            } else if (actionID == CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD_RES_VAL) {
                console.log(actionID, value);
            } else if (actionID == CONSTANTS.SEE_DETAILS_LISTING.SEE_DETAILS_RES_VAL) {
                console.log(actionID, value);
                await this.promptEntryDetails(Number(value));
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_IN_ENTRY_DETAILS, async ({ value, actionID }: UIInterfaces.ReturnObject) => {
            if (actionID == CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD_RES_VAL) {
                // await this.download(Number(value));
            } else if (actionID == CONSTANTS.ENTRY_DETAILS_CHECK.ENTRY_DETAILS_CHECK_RES_VAL) {
                let entryID: string = this.state.entryDataArr[Number(value)].ID;

                UI.Terminal.toggleCheckHashMap(entryID);

                await this.promptEntryDetails(Number(value));
            } else if (actionID == CONSTANTS.TURN_BACK_LISTING.TURN_BACK_RESULT_ID) {
                await this.promptResults();
            }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_AFTER_DOWNLOAD, async (selectedChoice: string) => {
            // if (selectedChoice.result.id == CONSTANTS.AFTER_DOWNLOAD_QUESTIONS.TURN_BACK_RESULT_ID) {
            //     await this.promptResults();
            // } else {
                    // UI.Terminal.showCursor();
            //     process.exit(0);
            // }
        });

        this.eventEmitter.on(this.events.USER_SELECTED_SEARCH_ANOTHER, async ({ value, actionID }: UIInterfaces.ReturnObject) => {
            if (actionID == CONSTANTS.SEARCH_ANOTHER_LISTINGS.SEARCH_ANOTHER_RESULT_ID) {
                await this.init();
            } else {
                // REWORK EXIT THING
                UI.Terminal.showCursor();
                process.exit(0);
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

    private static constructOptions(): UIInterfaces.ListingObject[] {
        let listings: UIInterfaces.ListingObject[] = [];

        listings.push(UIObjects.getOptionListingObject(
            CONSTANTS.PAGINATIONS.SEARCH,
            CONSTANTS.PAGINATIONS.SEARCH_RESULT_ID
        ));

        if (this.state.isNextPageExist) {
            let nextPageURL: string = this.constructURL(this.state.currentPage + 1);
            
            listings.push(UIObjects.getOptionListingObject(
                CONSTANTS.PAGINATIONS.NEXT_PAGE,
                CONSTANTS.PAGINATIONS.NEXT_PAGE_RESULT_VAL,
                nextPageURL
            ));
        }

        if (this.state.currentPage > 1) {
            let prevPageURL: string = this.constructURL(this.state.currentPage - 1);

            listings.push(UIObjects.getOptionListingObject(
                CONSTANTS.PAGINATIONS.PREV_PAGE,
                CONSTANTS.PAGINATIONS.PREV_PAGE_RESULT_VAL,
                prevPageURL
            ));
        }

        listings.push(UIObjects.getOptionListingObject(
            CONSTANTS.EXIT.EXIT,
            CONSTANTS.EXIT.EXIT_RESULT_ID
        ));

        return listings;
    }

    private static async connectionError(): Promise<void> {
        if (this.spinner.isSpinning()) {
            this.spinner.stop(true);
        }

        //FIX HERE

        UI.Terminal.prevLine();
        UI.Terminal.clearLine();

        // NEEDS REWORK HERE
        console.log(CONSTANTS.CONNECTION_ERROR);

        let searchAnotherObject: UIInterfaces.ListObject = UIObjects.getSearchAnotherListObject();
        let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(searchAnotherObject);
        this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
        // UI.Terminal.showCursor();
        // process.exit(1);
    }

    /**  **************************************************  */
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
    private static async setInput(): Promise<void> {
        let inputObject: UIInterfaces.promptObject = {
            type: 'input',
            text: UI.outputs.SEARCH
        }

        let input: UIInterfaces.ReturnObject = await UI.Main.prompt(inputObject);

        if (input.value.trim().length < CONFIG.MIN_INPUTLEN) {
            console.log(CONSTANTS.INPUT_MINLEN_WARNING);
        } else {
            this.state.query = encodeURIComponent(input.value);
        }
    }

    private static async setEntries(): Promise<void> {
        this.spinner.setSpinnerTitle(CONSTANTS.SPINNER.GETTING_RESULTS);
        this.spinner.start();

        this.state.url = this.constructURL(this.state.currentPage);
        let document: HTMLDocument | void = await this.getDocument(this.state.url);

        if (document) {
            if (!this.isSearchInputExistInDocument(document)) {
                this.state.connectionError = true;
                return;
            }

            this.state.isNextPageExist = await this.isNextPageExist();

            if (this.state.connectionError) {
                return;
            }
    
            let entryData: Interfaces.Entry[] = Entries.getAllEntries(document);
            this.state.entryDataArr = entryData;
        }
    }

    /**  **************************************************  */
    private static async getResponse(url: string): Promise<Response> {
        let response: Response = new Response();

        try {
            response = await fetch(url);
        } catch(error) {
            this.state.connectionError = true;
            this.state.errorText = error;
        }

        return response;
    }

    private static async getDocument(url: string): Promise<HTMLDocument | void> {
        let response: Response = await this.getResponse(url) || new Response();

        if (this.state.connectionError) {
            return;
        }

        let plainText: string = await response.text();

        return new JSDOM(plainText).window.document;
    }

    /**  **************************************************  */
    private static async constructDownloadEndpoint(entry: Interfaces.Entry): Promise<string | void> {
        let md5ReqURL: string = CONSTANTS.MD5_REQ_PATTERN.replace('{ID}', entry.ID);
        let md5Response: Response = await this.getResponse(md5ReqURL) || new Response();

        if (this.state.connectionError) {
            await this.connectionError();
            return;
        }

        let md5ResponseJson: [ {md5: string} ] = await md5Response.json();
        let entrymd5: string = md5ResponseJson[0].md5;
        
        let mirrorURL: string = CONSTANTS.MD5_DOWNLOAD_PAGE_PATTERN.replace('{MD5}', entrymd5);
        let mirrorDocument: HTMLDocument | void = await this.getDocument(mirrorURL);

        let downloadEndpoint: string = '';

        if (mirrorDocument) {
            downloadEndpoint = Entries.getDownloadURL(mirrorDocument)
        }

        return downloadEndpoint;
    }

    private static async download(entryIndex: number): Promise<void> {
        this.spinner.setSpinnerTitle(CONSTANTS.SPINNER.CONNECTING_MIRROR);
        this.spinner.start();

        let selectedEntry: Interfaces.Entry = this.state.entryDataArr[entryIndex];

        let downloadEndPoint: string = await this.constructDownloadEndpoint(selectedEntry) || '';

        let downloadResponse: Response = await this.getResponse(downloadEndPoint);

        if (this.state.connectionError) {
            await this.connectionError();
            return;
        }
        
        let fileAuthor: string = selectedEntry.Author;
        let fileTitle: string = selectedEntry.Title;
        let fileExtension: string = selectedEntry.Ext;
        
        let fileName: string = (`${fileAuthor} ${fileTitle}`).replace(CONSTANTS.STRING_REPLACE_REGEX,"");
        fileName = fileName.split(' ').join('_');

        let fullFileName: string = `./${fileName}.${fileExtension}`;

        let file: fs.WriteStream = fs.createWriteStream(fullFileName);

        let progressBar = new ProgressBar(CONSTANTS.PROGRESS_BAR.TITLE, {
            width: CONSTANTS.PROGRESS_BAR.WIDTH,
            complete: CONSTANTS.PROGRESS_BAR.COMPLETE,
            incomplete: CONSTANTS.PROGRESS_BAR.INCOMPLETE,
            renderThrottle: CONSTANTS.PROGRESS_BAR.RENDER_THROTTLE,
            total: parseInt(downloadResponse.headers.get('content-length') || '0')
        });

        this.spinner.stop(true);
        
        console.log(CONSTANTS.DIRECTORY_STRING, process.cwd());
        
        downloadResponse.body.on('data', chunk => {
            progressBar.tick(chunk.length);
        });
        
        downloadResponse.body.on('finish', async () => {
            this.promptAfterDownload(fileName, fileExtension);
        });
        
        downloadResponse.body.on('error', await this.connectionError);
        
        downloadResponse.body.pipe(file);
    }

    /**  **************************************************  */
    private static async promptResults(): Promise<void> {
        this.clear();
        let listObject: UIInterfaces.ListObject = UIObjects.getListObject(this.state.entryDataArr, this.state.currentPage);
        let paginationQuestionChoices: UIInterfaces.ListingObject[] = this.constructOptions();

        if (paginationQuestionChoices.length > 0) {
            listObject.listings = [...paginationQuestionChoices, ...listObject.listings];
        }

        this.state.listObject = listObject;

        console.log(CONSTANTS.RESULTS_TITLE
            .replace('{query}', this.state.query || ' ')
            .replace('{page}', this.state.currentPage.toString()));
        
        let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(this.state.listObject);

        this.eventEmitter.emit(this.events.USER_SELECTED_FROM_LIST, selectedChoice);
    }

    private static async promptEntryDetails(entryIndex: number): Promise<void> {
        this.clear();

        let selectedEntry: Interfaces.Entry = this.state.entryDataArr[entryIndex];
        let outputArr: string[] = Entries.getDetails(selectedEntry);

        outputArr.forEach(output => console.log(output));

        let entryCheckStatus: boolean = UI.Terminal.checkedItemsHashTable[selectedEntry.ID];

        let detailsListObject: UIInterfaces.ListObject = UIObjects.getEntryDetailsListObject(entryIndex, entryCheckStatus);

        let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(detailsListObject);

        this.eventEmitter.emit(this.events.USER_SELECTED_IN_ENTRY_DETAILS, selectedChoice);
    }

    private static async promptAfterDownload(fileName: string, fileExtension: string): Promise<void> {
        console.log(CONSTANTS.DOWNLOAD_COMPLETED, fileName, fileExtension);

        let afterDownloadListObject: UIInterfaces.ListObject = UIObjects.getAfterDownloadListObject();

        let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(afterDownloadListObject);

        this.eventEmitter.emit(this.events.USER_SELECTED_AFTER_DOWNLOAD, selectedChoice);
    }

    /**  **************************************************  */
    private static async executePromptFlow(): Promise<void> {
        this.state.connectionError = false;

        await this.setEntries();

        if (this.state.connectionError) {
            this.connectionError();
            return;
        }

        this.spinner.stop(true);

        if (this.state.entryDataArr.length > 0) {
            this.promptResults();
        } else {
            UI.Terminal.prevLine();
            UI.Terminal.clearLine();

            console.log(CONSTANTS.NO_RESULT);

            let searchAnotherObject: UIInterfaces.ListObject = UIObjects.getSearchAnotherListObject();
            let selectedChoice: UIInterfaces.ReturnObject = await UI.Main.prompt(searchAnotherObject);
            this.eventEmitter.emit(this.events.USER_SELECTED_SEARCH_ANOTHER, selectedChoice);
        }
    }
}
