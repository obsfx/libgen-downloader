import { UIInterfaces, List } from '../ui'

export namespace Interfaces {

    export interface AppState {
        currentPage: number;
        url: string;
        query: string | null;
        queryMinLenWarning: boolean;
        isNextPageExist: boolean;
        errorText: string;
        runtimeError: boolean;
        entryDataArr: Entry[] | [];
        listObject: List | null;
    }

    export interface Entry {
        ID: string;
        Author: string;
        Title: string;
        Publisher: string;
        Year: string;
        Pages: string;
        Lang: string;
        Size: string;
        Ext: string;
        Mirror: string;
    }

    export interface EntryData {
        md5: string;
        title: string;
        author: string;
        extension: string;
    }
}
