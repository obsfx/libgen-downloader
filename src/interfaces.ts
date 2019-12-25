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
    type: 'input' | 'number' | 'confirm' | 'list' | 'list';
    name: string;
    message: string;
    pageSize?: number;
    choices?: IQuestionChoice[];
}

export interface IQuestionChoice {
    name: string;
    value: string;
}

export interface IPagination {
    order: string;
    previous: string;
    next: string;
}