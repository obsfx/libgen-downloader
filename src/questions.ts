import { 
    IEntry, 
    IQuestionChoice, 
    IListQuestion, 
    IInputQuestion, 
    IListQuestionChoiceResult, 
    IListEntryDetailsQuestionChoiceResult 
} from './interfaces';

import config from './config';

const SearchQuestion: IInputQuestion = {
    type: "input",
    name: "result",
    message: "Search: "
}

const getQuestionChoice = (name: string, value: IListQuestionChoiceResult | IListEntryDetailsQuestionChoiceResult): IQuestionChoice => {
    return {
        name,
        value
    }
} 

const getQuestionChoices = (entries: IEntry[], pageNumber: number): IQuestionChoice[] => {
    let choices: IQuestionChoice[] = [];

    choices = entries.map((e, i) => {
        let title = `<${((pageNumber - 1) * config.RESULTS_PAGE_SIZE) + i + 1}> <${e.Ext}> ${e.Title}`;

        if (title.length > config.TITLE_MAX_STRLEN) {
            title = title.substr(0, config.TITLE_MAX_STRLEN) + "...";
        }

        return getQuestionChoice(title, { pagination: false, id: `${i}`, url: '' });
    });

    return choices.slice(0, config.RESULTS_PAGE_SIZE);
}

const getListQuestion = (entries: IEntry[], pageNumber: number): IListQuestion => {
    return {
        type: 'list',
        message: `Page: ${pageNumber} Results: `,
        name: 'result',
        pageSize: config.INQUIRER_PAGE_SIZE,
        choices: getQuestionChoices(entries, pageNumber)
    }
}

const getEntryDetailsQuestionChoice = (listUrl: string, entryID: string): IQuestionChoice[] => {
    let choices: IQuestionChoice[] = [];

    choices.push(
        getQuestionChoice('<- Turn Back To The List', {
            download: false, 
            id: entryID 
    }));

    choices.push(
        getQuestionChoice('>> Download This Media', {
            download: true, 
            id: entryID 
    }));

    return choices;
}

const getEntryDetailsQuestion = (listUrl: string, entryID: string): IListQuestion => {
    return {
        type: 'list',
        message: 'Options: ',
        name: 'result',
        pageSize: 2,
        choices: getEntryDetailsQuestionChoice(listUrl, entryID)
    }
}

export default {
    SearchQuestion,
    getQuestionChoice,
    getListQuestion,
    getEntryDetailsQuestion
};