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

export interface IInputQuestion extends IQuestion {
    type: 'input'
}

export interface IListQuestion extends IQuestion {
    type: 'list',
    pageSize: number,
    choices: IQuestionChoice[]
}

export interface IQuestionChoice {
    name: string;
    value: string;
}