"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const selectors_1 = __importDefault(require("./selectors"));
const querySelectText = (document, selector) => {
    var _a;
    const text = (_a = document.querySelector(selector)) === null || _a === void 0 ? void 0 : _a.textContent;
    if (!text)
        return ' ';
    return text;
};
exports.getAllEntries = (document) => {
    const entryArray = [];
    const entryAmount = document.querySelectorAll(`${selectors_1.default.container} tr`).length;
    for (let i = 1; i < entryAmount; i++) {
        const entrySelectors = selectors_1.default.getEntrySelector(i);
        entryArray.push({
            ID: querySelectText(document, entrySelectors.ID),
            Author: querySelectText(document, entrySelectors.Author),
            Title: querySelectText(document, entrySelectors.Title),
            Publisher: querySelectText(document, entrySelectors.Publisher),
            Year: querySelectText(document, entrySelectors.Year),
            Pages: querySelectText(document, entrySelectors.Pages),
            Lang: querySelectText(document, entrySelectors.Lang),
            Size: querySelectText(document, entrySelectors.Size),
            Ext: querySelectText(document, entrySelectors.Ext),
            Mirror: ""
        });
    }
    return entryArray;
};
