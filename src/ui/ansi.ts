export default {
    CLEARSCREEN: '\u001b[H\u001bc',
    CLEARCURSORTOEND: '\u001b[0J',

    TURNBACKTOBEGINNINGOFLINE: '\u001b[1000D',

    HIDECURSOR: '\u001b[?25l',
    SHOWCURSOR: '\u001b[?25h',
    SAVECURSORPOS: '\u001b[s',
    RESTORECURSORPOS: '\u001b[u',

    PREVLINE: '\u001b[1F',
    NEXTLINE: '\u001b[1E',
    CLEARLINE: '\u001b[2K',

    PREVLINEX: '\u001b[{x}F',
    NEXTLINEX: '\u001b[{x}E',

    SETXY: '\u001b[{y};{x}H',

    BLACK: '\u001b[30m',
    RED: '\u001b[31m',
    GREEN: '\u001b[32m',
    YELLOW: '\u001b[33m',
    BLUE: '\u001b[34m',
    MAGENTA: '\u001b[35m',
    CYAN: '\u001b[36m',
    WHITE: '\u001b[37m',

    BRIGHTBLACK: '\u001b[30;1m',
    BRIGHTRED: '\u001b[31;1m',
    BRIGHTGREEN: '\u001b[32;1m',
    BRIGHTYELLOW: '\u001b[33;1m',
    BRIGHTBLUE: '\u001b[34;1m',
    BRIGHTMAGENTA: '\u001b[35;1m',
    BRIGHTCYAN: '\u001b[36;1m',
    BRIGHTWHITE: '\u001b[37;1m',

    RESETCOLOR: '\u001b[0m',
}
