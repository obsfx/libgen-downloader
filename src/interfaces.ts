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

export interface IQuestion {
    type: string;
    name: string;
    message: string;
    choices?: IQuestionChoice[];
}

export interface IQuestionChoice {
    name: string;
    value: string;
}