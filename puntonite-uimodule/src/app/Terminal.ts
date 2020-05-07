import { Interfaces } from '../interfaces.namespace';

import ascii from '../ascii';

export default abstract class Terminal {
    private static cursorIndex: number = 0;
    private static currentList: (Interfaces.ListingObject | undefined)[] = [];

    public static clear(): void {
        process.stdout.write(ascii.CLEARSCREEN)
    }

    public static hideCursor(): void {
        process.stdout.write(ascii.HIDECURSOR);
    }

    public static showCursor(): void {
        process.stdout.write(ascii.SHOWCURSOR);
    }

    public static clearLine(): void {
        process.stdout.write(ascii.CLEARLINE);
    }

    public static prevLine(): void {
        process.stdout.write(ascii.PREVLINE);
    }

    public static nextLine(): void {
        process.stdout.write(ascii.NEXTLINE);
    }

    public static promptList(arr: (Interfaces.ListingObject | undefined)[]): void {
        this.cursorIndex = Math.floor(arr.length / 2);
        this.currentList = arr;

        this.renderList();
    }

    public static prevListing(): void {
        this.currentList.unshift(this.currentList.pop())
        this.renderList();
    }

    public static nextListing(): void {
        this.currentList.push(this.currentList.shift())
        this.renderList();
    }

    private static renderList(): void {
        this.clear();

        let output: string = '';

        for (let i: number = 0; i < this.currentList.length; i++) {
            if (i == this.cursorIndex) {
                output += ' > '
            } else {
                output += '   ';
            }

            output += '┄ '

            output += `${this.currentList[i]?.text}\n`;
        }

        process.stdout.write(output);
    }

    public static getCurrentListing(): string {
        return this.currentList[this.cursorIndex]?.value || ' ';
    }

    public static promptInput(promptHead: string): void {
        process.stdout.write(promptHead);
    }
}