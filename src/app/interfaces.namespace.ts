import { UIInterfaces } from '../ui'

export namespace Interfaces {

    export interface AppState {
        currentPage: number;
        url: string;
        query: string | null;
        isNextPageExist: boolean;
        errorText: string;
        runtimeError: boolean;
        entryDataArr: Entry[] | [];
        listObject: UIInterfaces.ListObject | null;
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
}
