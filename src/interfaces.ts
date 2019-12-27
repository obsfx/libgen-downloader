export interface IEntry {
    ID: string;
    Author: string;
    Title: string;
    Publisher: string;
    Year: string;
    Pages: string;
    Lang: string;
    Size: string;
    Ext: string;
    Mirror: string | string[];
}

interface IQuestion {
    name: string;
    message: string;
}

export interface IQuestionInput extends IQuestion {
    type: 'input'
}

export interface IQuestionList extends IQuestion {
    type: 'list',
    pageSize: number,
    choices: IQuestionChoice[]
}

export interface IQuestionChoice {
    name: string;
    value: string;
}