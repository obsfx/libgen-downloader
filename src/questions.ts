import { IQuestion, IEntry, IQuestionChoice } from './interfaces';

const QSearch: IQuestion = {
    type: "input",
    name: "searchInput",
    message: "Search: "
}

const getQuestionChoices = (entries: IEntry[]): IQuestionChoice[] => {
    let choices: IQuestionChoice[] = [];

    choices = entries.map((e, i) => {
       let title = (e.Title.length > 73) ? e.Title.substr(0, 70) + '...' : e.Title;
        return  {
            //name: `<${e.ID}> ${e.Title} | (${e.Author}) - ${e.Publisher}`,
            // name: `[${i + 1}] <${e.ID}> ${e.Title}`.substr(0, 80),
            name: `<${i + 1}> <${e.Ext}> ${title}`,
            value: '${i}'
        }
    });

    return choices;
}

const getListQuestion = (entries: IEntry[]): IQuestion => {
    return {
        type: 'list',
        message: `Results: ${entries.length}`,
        name: 'listInput',
        pageSize: 15,
        choices: getQuestionChoices(entries)
    }
}

export default {
    QSearch,
    getListQuestion
};