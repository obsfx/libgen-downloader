import { 
    IEntry, 
    IQuestionChoice, 
    IListQuestion, 
    IInputQuestion, 
    IListQuestionChoiceResult, 
    IListEntryDetailsQuestionChoiceResult 
} from './interfaces';

import config from './config';

const QSearch: IInputQuestion = {
    type: "input",
    name: "searchInput",
    message: "Search: "
}

const getQuestionChoice = (name: string, value: IListQuestionChoiceResult | IListEntryDetailsQuestionChoiceResult): IQuestionChoice => {
    return {
        name,
        value
    }
} 

const getQuestionChoices = (entries: IEntry[]): IQuestionChoice[] => {
    let choices: IQuestionChoice[] = [];

    choices = entries.map((e, i) => {
        let title = `<${i + 1}> <${e.Ext}> ${e.Title}`;

        if (title.length > config.TITLE_MAX_STRLEN) {
            title = title.substr(0, config.TITLE_MAX_STRLEN) + "...";
        }

        return getQuestionChoice(title, { pagination: false, id: `${i}`, url: '' });
    });

    return choices.slice(0, config.RESULTS_PAGE_SIZE);
}

const getListQuestion = (entries: IEntry[]): IListQuestion => {
    return {
        type: 'list',
        message: `Results: `,
        name: 'result',
        pageSize: config.INQUIRER_PAGE_SIZE,
        choices: getQuestionChoices(entries)
    }
}

const getEntryDetailsQuestionChoice = (listUrl: string, downloadUrl: string): IQuestionChoice[] => {
    let choices: IQuestionChoice[] = [];

    choices.push(
        getQuestionChoice('<- Turn Back To The List', {
            download: false, 
            url: listUrl 
    }));

    choices.push(
        getQuestionChoice('>> Download This Media', {
            download: true, 
            url: downloadUrl 
    }));

    return choices;
}

const getEntryDetailsQuestion = (listUrl: string, downloadUrl: string): IListQuestion => {
    return {
        type: 'list',
        message: 'Options: ',
        name: 'result',
        pageSize: 2,
        choices: getEntryDetailsQuestionChoice(listUrl, downloadUrl)
    }
}

export default {
    QSearch,
    getQuestionChoice,
    getListQuestion,
    getEntryDetailsQuestion
};