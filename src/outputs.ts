import { yellow, green, cyan, red } from 'kleur';

export default {
    SPINNER_GETTING_RESULTS: `${cyan().bold('Getting Results')}... %s`,
    INPUT_MINLEN_WARNING: `${yellow().bold('Search string must contain minimum 3 characters.')} Please, type in a longer request and try again.`,
    CONNECTION_ERROR: `${red().bold('Connection Error.')} Probably libgen servers are not currently available. Please try again after a while.`,
    ENTRY_DETAILS_HEAD: {
        ID: `${yellow().bold('ID')}`,
        Author: `${yellow().bold('Author')}`,
        Title: `${yellow().bold('Title')}`,
        Publisher: `${yellow().bold('Publisher')}`,
        Year: `${yellow().bold('Year')}`,
        Pages: `${yellow().bold('Pages')}`,
        Lang: `${yellow().bold('Lang')}`,
        Size: `${yellow().bold('Size')}:`,
        Ext: `${yellow().bold('Extension')}`,
        Mirror: `${yellow().bold('Mirror')}`,
    }
}