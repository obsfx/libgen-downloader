import events from 'events';
import fs from 'fs';
import readline from 'readline';

import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Spinner } from 'cli-spinner';
import ProgressBar from 'progress';
import { yellow, green, cyan, red } from 'kleur';

import questions from './questions';
import entries from './entries';
import { CSS_Selectors } from './selectors';
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

let appState: IAppState;

const prompt: inquirer.PromptModule = inquirer.createPromptModule();

const spinner = new Spinner();
spinner.setSpinnerString('|/-\\');

const eventEmitter = new events.EventEmitter();
eventEmitter.on('userSelectedOnList', async (selected: IListQuestionResult) => {
    if (selected.result.pagination) {
        appState.currentPage = (selected.result.pagination == 'next') ? 
        appState.currentPage + 1 : 
        appState.currentPage - 1;

        await getAndPromptResults();
    } else if (selected.result.id == 'searchAgain') {
        await getInput();
    } else if (selected.result.id == 'exit') {
        process.exit(0);
    } else {
        await promptDetails(selected.result.id);
    }
});

eventEmitter.on('userSelectedOnDetails', async (selected: IListEntryDetailsQuestionResult) => {
    if (selected.result.download) {
        await downloadMedia(selected.result.id);
    } else {
        readline.cursorTo(process.stdout, 0, 4);
        readline.clearScreenDown(process.stdout);
        await promptResults();
    }
});

const connectionError = (): void => {
    if (spinner.isSpinning()) {
        spinner.stop(true);
    }

    console.log(`${red().bold('Connection Error.')} Probably libgen servers is not currently available. Please try again after a while.`);
    process.exit(1);
}
 
const isSearchInputExist = (document: HTMLDocument): boolean => {
    const searchInput = document.querySelector(CSS_Selectors.SEARCH_INPUT);
    return (searchInput) ? true : false;
}

const isNextPageExist = async (): Promise<boolean> => {
    const nextPageUrl: string = getUrl(appState.query, appState.currentPage + 1);
    const document: HTMLDocument = await getDocument(nextPageUrl);

    let entryAmount: number = document.querySelectorAll(`${CSS_Selectors.TABLE_CONTAINER} tr`).length;

    return (entryAmount > 1) ? true : false;
}

const getResponse = async (pageUrl: string): Promise<Response> => {
    let response: any = "";

    try {
        response = await fetch(pageUrl);
    } catch(err) {
        appState.connectionError = true;
    }

    return response;
}

const getDocument = async (pageUrl: string): Promise<HTMLDocument> => {
    let response: any  = await getResponse(pageUrl);

    if (appState.connectionError) {
        connectionError();
        return new HTMLDocument();
    }

    let plainText = await response.text();

    const document: HTMLDocument = new JSDOM(plainText).window.document;

    return document;
}

const getResults = async (): Promise<void> => {
    spinner.setSpinnerTitle(`${cyan().bold('Getting Results')}... %s`);
    spinner.start();

    appState.url = getUrl(appState.query, appState.currentPage);

    const document: HTMLDocument = await getDocument(appState.url);

    if (!isSearchInputExist(document)) {
        appState.connectionError = true;
        return void 0;
    }

    let entryDataArr: IEntry[] = entries.getAllEntries(document);

    appState.isNextPageExist = await isNextPageExist();
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
        console.log(`${cyan().bold('No Result.')}`);
    }
}

const getAndPromptResults = async () => {
    appState.connectionError = false;

    await getResults();

    if (!appState.connectionError) {
        await promptResults();
    } else {
        connectionError();
    }
}

const promptDetails = async (entryID: string): Promise<void> => {
    let selectedEntry: IEntry = appState.entryDataArr[Number(entryID)];
    let textArr: string[] = entries.getDetails(selectedEntry);

    textArr.forEach(data => console.log(data));

    let detailsQuestion: IListQuestion = questions.getEntryDetailsQuestion(appState.url, entryID);

    let selectedOption: IListEntryDetailsQuestionResult = await prompt(detailsQuestion);

    eventEmitter.emit('userSelectedOnDetails', selectedOption);
}

const downloadMedia = async (entryID: string): Promise<void> => {
    spinner.setSpinnerTitle(`${cyan().bold('Connecting to Mirror')}... %s`);
    spinner.start();

    let selectedEntry: IEntry = appState.entryDataArr[Number(entryID)];

    const URLParts: string[] = selectedEntry.Mirror.split('/');
    const document: HTMLDocument = await getDocument(selectedEntry.Mirror);

    if (appState.connectionError) {
        connectionError();
        return void 0;
    }

    let downloadUrl: string = entries.getDownloadURL(document);

    downloadUrl = `${URLParts[0]}//${URLParts[2]}${downloadUrl}`;

    let response: any = await getResponse(downloadUrl);

    if (appState.connectionError) {
        connectionError();
        return void 0;
    }

    const fileName = selectedEntry.Title.split(' ').join('_');
    const fileExtension = selectedEntry.Ext;

    const file = fs.createWriteStream(`./${fileName}.${fileExtension}`);

    const progressBar = new ProgressBar(`${green().bold('-> Downloading')} [:bar] :percent :current`, {
        width: 40,
        complete: '=',
        incomplete: '.',
        renderThrottle: 1,
        total: parseInt(response.headers.get('content-length'))
    });

    spinner.stop(true);
    
    response.body.on('data', (chunk: any) => progressBar.tick(chunk.length));
    response.body.on('error', () => connectionError());
    response.body.on('finish', () => console.log(`${green().bold('DONE')} ${yellow().bold(`${fileName}.${fileExtension}`)} downloaded on working directory.`));
    response.body.pipe(file);
}

const getInput = async (): Promise<void> => {
    appState = {
        currentPage: 1,
        url: '',
        query: '',
        isNextPageExist: false,
        connectionError: false,
        entryDataArr : [],
        listQuestion: []
    }

    let input: IInputQuestionResult = await prompt([
        questions.SearchQuestion
    ]);

    appState.query = input.result;

    await getAndPromptResults();
}

const main = async (): Promise<void> => {

    /* 
        TODO:
        ->  More polished outputs
        next page error - done
        error handlings
    */

   readline.cursorTo(process.stdout, 0, 0);
   readline.clearScreenDown(process.stdout);

    console.log(`${yellow().bold('libgen-downloader')} - ${yellow().bold('0.1.0')}`);
    console.log(`${cyan().bold('https://github.com/obsfx/libgen-cli-downloader')} - ${cyan().bold('obsfx')}`);
    console.log('---------------------------------------------');

    await getInput();
}

main();