import { Interfaces } from './interfaces.namespace';

import CONFIG from './config';
import OUTPUTS from './outputs';

import Questions from './questions';
import Selectors from './selectors';
import Entries from './entries';

import fetch, { Response } from 'node-fetch';
import inquirer from 'inquirer';
import { Spinner } from 'cli-spinner';
import { JSDOM } from 'jsdom';

import { EventEmitter } from 'events';

export default class App implements Interfaces.App {
    state: Interfaces.AppState;
    prompt: inquirer.PromptModule;
    spinner: Spinner;
    eventEmitter: EventEmitter;

    constructor() {
        this.state = this.createNewAppState();
        this.prompt = inquirer.createPromptModule();
        this.spinner = new Spinner();
        this.eventEmitter = new EventEmitter();
    }

    /**  **************************************************  */
    createNewAppState(): Interfaces.AppState {
        return {
            currentPage: 1,
            url: '',
            query: null,
            isNextPageExist: false,
            errorText: '',
            connectionError: false,
            entryDataArr: [],
            listQuestion: []
        }
    }

    constructURL(pageNumber: number): string {
        let url: string = CONFIG.MIRROR;

        url += `${CONFIG.URL_PARTS.SEARCH_PAGE}?`;

        url += `&${CONFIG.URL_PARTS.PARAMS.QUERY}=${this.state.query}`;
        url += `&${CONFIG.URL_PARTS.PARAMS.PAGE}=${pageNumber}`;
        url += `&${CONFIG.URL_PARTS.PARAMS.PAGE_SIZE}=${CONFIG.RESULTS_PAGE_SIZE}`
        url += `&${CONFIG.URL_PARTS.PARAMS.SORT_MODE}=${CONFIG.URL_PARTS.PARAMS.SORT_MODE_VAL}`;

        return url;
    }

    connectionError(): void {
        if (this.spinner.isSpinning()) {
            this.spinner.stop(true);
        }

        console.log(OUTPUTS.CONNECTION_ERROR);
        process.exit(1);
    }

    /**  **************************************************  */
    isSearchInputExistInDocument(document: HTMLDocument): boolean {
        const searchInput = document.querySelector(Selectors.CSS_SELECTORS.SEARCH_INPUT);
        return (searchInput) ? true : false;
    }

    async isNextPageExist(): Promise<boolean> {
        let nextPageURL: string = this.constructURL(this.state.currentPage + 1);
        let document: HTMLDocument = await this.getDocument(nextPageURL);

        let entryAmount: number = document.querySelectorAll(Selectors.CSS_SELECTORS.ROW).length;

        return (entryAmount > 1) ? true : false;
    }

    /**  **************************************************  */
    async setInput(): Promise<void> {
        let input: Interfaces.InputQuestionResult = await this.prompt([
            Questions.SearchQuestion
        ]);

        if (input.result.trim().length < CONFIG.MIN_INPUTLEN) {
            console.log(OUTPUTS.INPUT_MINLEN_WARNING);
        } else {
            this.state.query = encodeURIComponent(input.result);
        }
    }

    async setEntries(): Promise<void> {
        this.spinner.setSpinnerTitle(OUTPUTS.SPINNER_GETTING_RESULTS);
        this.spinner.start();

        this.state.url = this.constructURL(this.state.currentPage);

        let document: HTMLDocument = await this.getDocument(this.state.url);

        if (this.isSearchInputExistInDocument(document)) {
            this.state.connectionError = true;
            this.connectionError();
        }

        let entryData: Interfaces.Entry[] = Entries.getAllEntries(document);
        this.state.entryDataArr = entryData;

        this.state.isNextPageExist = await this.isNextPageExist();
    }

    /**  **************************************************  */
    async getResponse(url: string): Promise<Response> {
        let response: Response = new Response();

        try {
            response = await fetch(url);
        } catch(error) {
            this.state.connectionError = true;
            this.state.errorText = error;
        }

        return response;
    }

    async getDocument(url: string): Promise<HTMLDocument> {
        let response: Response = await this.getResponse(url) || new Response();

        if (this.state.connectionError) {
            this.connectionError();
        }

        let plainText: string = await response.text();

        return new JSDOM(plainText).window.document;
    }
}

const pseudoFlow = async () => {
    const app: App = new App();

    while (app.state.query == null) {
        await app.setInput();
    }

    await app.setEntries();

    if (app.state.connectionError) {
        app.connectionError();
    }

    // promptresults
}