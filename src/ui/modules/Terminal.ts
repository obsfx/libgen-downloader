import ansi from '../ansi';

export default abstract class Terminal {
    /*********************************************** */
    public static clear(): void {
        if (process.platform == 'win32') {
            process.stdout.write(ansi.CLEARSCREEN_WIN);
        } else {
            process.stdout.write(ansi.CLEARSCREEN);
        }
    }

    public static clearCursorToEnd(): void {
        process.stdout.write(ansi.CLEARCURSORTOEND);
    }

    public static saveCursorPos(): void {
        process.stdout.write(ansi.SAVECURSORPOS);
    }

    public static restoreCursorPos(): void {
        process.stdout.write(ansi.RESTORECURSORPOS);
    }

    public static clearLine(): void {
        process.stdout.write(ansi.CLEARLINE);
    }

    public static turnBackToBeginningOfLine(): void {
        process.stdout.write(ansi.TURNBACKTOBEGINNINGOFLINE);
    }

    public static hideCursor(): void {
        process.stdout.write(ansi.HIDECURSOR);
    }

    public static showCursor(): void {
        process.stdout.write(ansi.SHOWCURSOR);
    }

    public static prevLine(): void {
        process.stdout.write(ansi.PREVLINE);
    }

    public static nextLine(): void {
        process.stdout.write(ansi.NEXTLINE);
    }

    public static prevLineX(x: number): void {
        process.stdout.write(ansi.PREVLINEX.replace('{x}', x.toString()));
    }

    public static nextLineX(x: number): void {
        process.stdout.write(ansi.NEXTLINEX.replace('{x}', x.toString()));
    }

    public static cursorXY(x: number, y: number): void {
        process.stdout.write(ansi.SETXY.replace('{x}', x.toString()).replace('{y}', y.toString()));
    }

    public static clearXY(x: number, y: number): void {
        this.cursorXY(x, y);
        process.stdout.write(' ');
    }
}
