import events from 'events';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Spinner } from 'cli-spinner';

import config from './config';
import questions from './questions';
import entries from './entries';
import { getPaginations } from './pagination';
import { getUrl } from './url';
import { 
    IQuestionChoice, 
    IListQuestion, 
    IListQuestionResult, 
    IListEntryDetailsQuestionResult, 
    IAppState,
    IInputQuestionResult,
    IEntry
} from './interfaces';

let appState: IAppState = {
    currentPage: 1,
    url: '',
    query: '',
    isNextPageExist: false,
    entryDataArr : [],
    listQuestion: []
}

const eventEmitter = new events.EventEmitter();

eventEmitter.on('userSelectedOnList', async (selected: IListQuestionResult) => {
    if (selected.result.pagination) {
        appState.currentPage = (selected.result.pagination == 'next') ? 
        appState.currentPage + 1 : 
        appState.currentPage - 1;

        await getResults();
        await promptResults();
    } else {
        await promptDetails(Number(selected.result.id));
    }
});

eventEmitter.on('userSelectedOnDetails', async (selected: IListEntryDetailsQuestionResult) => {
    if (selected.result.download) {
        await downloadMedia(selected.result.url);
    } else {
        await promptResults();
    }
});

const prompt: inquirer.PromptModule = inquirer.createPromptModule();
const spinner = new Spinner('Getting Results... %s');
spinner.setSpinnerString('|/-\\');

const getResponse = async (pageUrl: string): Promise<{ response: any, error: any }> => {
    let response: any = "";
    let error: boolean = false;

    try {
        response = await fetch(pageUrl);
    } catch(err) {
        error = err;
    }

    return { response, error }
}

const getDocument = async (pageUrl: string): Promise<HTMLDocument> => {
    let { response, error }: { response: any, error: any }  = await getResponse(pageUrl);

    if (error) {
        console.log(error);
        return new HTMLDocument();
    }

    let plainText = await response.text();

    const document: HTMLDocument = new JSDOM(plainText).window.document;

    return document;
}

const getResults = async (): Promise<void | number> => {
    spinner.start();

    appState.url = getUrl(appState.query, appState.currentPage);
    console.log(appState.url);

    const document: HTMLDocument = await getDocument(appState.url);

    let { isNextPageExist, entryDataArr } = entries.getAllEntries(document);

    appState.isNextPageExist = isNextPageExist;
    appState.entryDataArr = entryDataArr;
}

const promptResults = async (): Promise<void> => {
    if (appState.entryDataArr.length != 0) {
        let listQuestion: IListQuestion = questions.getListQuestion(appState.entryDataArr, appState.currentPage);
        let paginationQuestionChoices: IQuestionChoice[] = getPaginations(appState.query, appState.currentPage, appState.isNextPageExist);

        listQuestion.choices = paginationQuestionChoices.concat(listQuestion.choices);
        appState.listQuestion = listQuestion;
        spinner.stop(true);

        let selected: IListQuestionResult = await prompt(appState.listQuestion);

        eventEmitter.emit('userSelectedOnList', selected);
    } else {
        spinner.stop(true);
        console.log("No Result");
    }
}

const promptDetails = async (entryID: number): Promise<void> => {
    let selectedEntry: IEntry = appState.entryDataArr[entryID];
    let textArr: string[] = entries.getDetails(selectedEntry);

    textArr.forEach(data => console.log(data));

    let detailsQuestion: IListQuestion = questions.getEntryDetailsQuestion(appState.url, selectedEntry.Mirror);

    let selectedOption: IListEntryDetailsQuestionResult = await prompt(detailsQuestion);

    eventEmitter.emit('userSelectedOnDetails', selectedOption);
}

const downloadMedia = async (mirrorUrl: string) => {
    spinner.start();
    console.log(mirrorUrl);

    const URLParts: string[] = mirrorUrl.split('/');
    const document: HTMLDocument = await getDocument(mirrorUrl);

    let downloadUrl: string = entries.getDownloadURL(document);

    downloadUrl = `${URLParts[0]}//${URLParts[2]}${downloadUrl}`;

    console.log(downloadUrl);
    spinner.stop(true);
}

const main = async (): Promise<void> => {

    /* 
        TODO:
        ->  More polished outputs
    */

    console.log("libgen-downloader");
    console.log("obsfx.github.io");

    let input: IInputQuestionResult = await prompt([
        questions.SearchQuestion
    ]);

    appState.query = input.result;

    await getResults();
    await promptResults();
}

main();