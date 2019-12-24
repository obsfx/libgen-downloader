interface IQuestion {
    type: string;
    name: string;
    message: string;
    choices?: Array<IQuestionChoice>;
}

interface IQuestionChoice {
    name: string;
    value: string;
}

const QSearch: IQuestion = {
    type: "input",
    name: "qsearch",
    message: "Search: "
}

export default {
    QSearch
};