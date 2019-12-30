"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const kleur_1 = require("kleur");
const selectors_1 = __importStar(require("./selectors"));
const querySelectText = (document, selector) => {
    var _a;
    let text = (_a = document.querySelector(selector)) === null || _a === void 0 ? void 0 : _a.textContent;
    if (!text)
        return ' ';
    return text;
};
const getEntryData = (document, entrySelector) => {
    var _a;
    return {
        ID: querySelectText(document, entrySelector.ID),
        Author: querySelectText(document, entrySelector.Author),
        Title: querySelectText(document, entrySelector.Title),
        Publisher: querySelectText(document, entrySelector.Publisher),
        Year: querySelectText(document, entrySelector.Year),
        Pages: querySelectText(document, entrySelector.Pages),
        Lang: querySelectText(document, entrySelector.Lang),
        Size: querySelectText(document, entrySelector.Size),
        Ext: querySelectText(document, entrySelector.Ext),
        Mirror: ((_a = document.querySelector(entrySelector.Mirror)) === null || _a === void 0 ? void 0 : _a.getAttribute('href')) || ' '
    };
};
const getAllEntries = (document) => {
    let entryDataArr = [];
    let entryAmount = document.querySelectorAll(`${selectors_1.CSS_Selectors.TABLE_CONTAINER} tr`).length;
    for (let i = selectors_1.default.THeadRow; i < entryAmount; i++) {
        const entrySelector = selectors_1.default.getEntrySelector(i + 1);
        entryDataArr.push(getEntryData(document, entrySelector));
    }
    return entryDataArr;
};
const getDetails = (entry) => {
    let textArr = [
        `${kleur_1.yellow().bold('ID')}: ${entry.ID}`,
        `${kleur_1.yellow().bold('Author')}: ${entry.Author}`,
        `${kleur_1.yellow().bold('Title')}: ${entry.Title}`,
        `${kleur_1.yellow().bold('Publisher')}: ${entry.Publisher}`,
        `${kleur_1.yellow().bold('Year')}: ${entry.Year}`,
        `${kleur_1.yellow().bold('Pages')}: ${entry.Pages}`,
        `${kleur_1.yellow().bold('Lang')}: ${entry.Lang}`,
        `${kleur_1.yellow().bold('Size')}: ${entry.Size}`,
        `${kleur_1.yellow().bold('Ext')}: ${entry.Ext}`,
        `${kleur_1.yellow().bold('Mirror')}: ${entry.Mirror}`,
        '---------------------------------------------'
    ];
    return textArr;
};
const getDownloadURL = (document) => {
    var _a;
    let downloadURL = ((_a = document.querySelector('#info h2 a')) === null || _a === void 0 ? void 0 : _a.getAttribute('href')) || ' ';
    return downloadURL;
};
exports.default = {
    getAllEntries,
    getDetails,
    getDownloadURL
};
