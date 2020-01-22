import { Response } from 'node-fetch';
import inquirer from 'inquirer';
import { Spinner } from 'cli-spinner';

import { EventEmitter } from 'events';

export namespace Interfaces {
    export interface App {
        state: AppState;
        prompt: inquirer.PromptModule;
        spinner: Spinner;
        eventEmitter: EventEmitter;

        createNewAppState(): AppState;
        clear(): void;

        init(): Promise<void>;
        initEventHandlers(): Promise<void>;

        constructURL(pageNumber: number): string;
        constructPaginations(pageNumber: number): QuestionChoice[];
        connectionError(): void;

        isSearchInputExistInDocument(document: HTMLDocument): boolean;
        isNextPageExist(): Promise<boolean>;

        setInput(): Promise<void>;
        setEntries(): Promise<void>;

        getResponse(url :string): Promise<Response>;
        getDocument(url: string): Promise<HTMLDocument>;

        download(entryIndex: number): Promise<void>;

        promptResults(): Promise<void>;
        promptEntryDetails(entryIndex: number): Promise<void>;

        executePromptFlow(): Promise<void>;
    }

    export interface AppState {
        currentPage: number;
        url: string;
        query: string | null;
        isNextPageExist: boolean;
        errorText: string;
        connectionError: boolean;
        entryDataArr: Entry[] | [];
        listQuestion: ListQuestion | [];
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

    export interface Question {
        name: string;
        message: string;
    }

    export interface QuestionChoice {
        name: string;
        value: object;
    }
    
    export interface InputQuestion extends Question {
        type: 'input';
    }

    export interface InputQuestionResult {
        result: string;
    }
    
    export interface ListQuestion extends Question {
        type: 'list';
        pageSize: number;
        choices: QuestionChoice[];
    }
    
    export interface ListQuestionResult {
        result: ListQuestionChoiceResult;
    }
    
    export interface ListQuestionChoiceResult {
        pagination: boolean | string;
        id: string;
        url: string;
    }
    
    export interface EntryDetailsQuestionResult {
        result: EntryDetailsQuestionChoiceResult;
    }
    
    export interface EntryDetailsQuestionChoiceResult {
        download: boolean;
        id: string;
    }
}