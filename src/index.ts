import events from 'events';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Spinner } from 'cli-spinner';

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
        console.log("downloading");
    } else {
        await promptResults();
    }
});

const prompt: inquirer.PromptModule = inquirer.createPromptModule();
const spinner = new Spinner('Getting Results... %s');
spinner.setSpinnerString('|/-\\');

const getResponse = async (pageUrl: string): Promise<{ plainText: string, error: any }> => {
    let plainText: any = "";
    let error: boolean = false;

    try {
        let response = await fetch(pageUrl);
        plainText = await response.text();
    } catch(err) {
        error = err;
    }

    return { plainText, error }
}

const getResults = async () => {
    spinner.start();

    appState.url = getUrl(appState.query, appState.currentPage);
    console.log(appState.url);

    let { plainText, error }: any = await getResponse(appState.url);

    if (error) {
        console.log(error);
        return 1;
    }

    const document: HTMLDocument = new JSDOM(plainText).window.document;

    let { isNextPageExist, entryDataArr } = entries.getAllEntries(document);

    appState.isNextPageExist = isNextPageExist;
    appState.entryDataArr = entryDataArr;
}

const promptResults = async () => {
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

const promptDetails = async (entryID: number) => {
    let selectedEntry: IEntry = appState.entryDataArr[entryID];
    let entryData: string[] = entries.getDetails(selectedEntry);

    entryData.forEach(data => console.log(data));

    let detailsQuestion: IListQuestion = questions.getEntryDetailsQuestion(appState.url, '');

    let selectedOption: IListEntryDetailsQuestionResult = await prompt(detailsQuestion);

    eventEmitter.emit('userSelectedOnDetails', selectedOption);
}

const main = async () => {

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