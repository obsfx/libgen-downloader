import { IEntry, IQuestionChoice, IListQuestion, IInputQuestion, IListQuestionResult, IListQuestionChoiceResult } from './interfaces';
import config from './config';

const QSearch: IInputQuestion = {
    type: "input",
    name: "searchInput",
    message: "Search: "
}

const getQuestionChoice = (name: string, value: IListQuestionChoiceResult): IQuestionChoice => {
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
        message: `Results: ${entries.length}`,
        name: 'listInput',
        pageSize: config.INQUIRER_PAGE_SIZE,
        choices: getQuestionChoices(entries)
    }
}

export default {
    QSearch,
    getQuestionChoice,
    getListQuestion
};