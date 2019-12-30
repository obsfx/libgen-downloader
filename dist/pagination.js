"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const questions_1 = __importDefault(require("./questions"));
const url_1 = require("./url");
exports.getPaginations = (query, currentPage, isNextPageExist) => {
    let choices = [];
    choices.push(questions_1.default.getQuestionChoice('>> Search', { pagination: false, url: '', id: 'searchAgain' }));
    if (isNextPageExist) {
        let nextPageUrl = url_1.getUrl(query, currentPage + 1);
        choices.push(questions_1.default.getQuestionChoice('-> Next Page', { pagination: 'next', url: nextPageUrl, id: '' }));
    }
    if (currentPage > 1) {
        let prevPageUrl = url_1.getUrl(query, currentPage - 1);
        choices.push(questions_1.default.getQuestionChoice('<- Previous Page', { pagination: 'prev', url: prevPageUrl, id: '' }));
    }
    choices.push(questions_1.default.getQuestionChoice('<< Exit', { pagination: false, url: '', id: 'exit' }));
    return choices;
};
