export default {
    CLEARSCREEN: '\u001b[1000A\u001b[1000D\u001b[0J',
    CLEARCURSORTOEND: '\u001b[0J',

    HIDECURSOR: '\u001B[?25l',
    SHOWCURSOR: '\u001B[?25h',

    PREVLINE: '\u001b[1F',
    NEXTLINE: '\u001b[1E',
    CLEARLINE: '\u001b[2K',

    PREVLINEX: '\u001b[{x}F',
    NEXTLINEX: '\u001b[{x}E',

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