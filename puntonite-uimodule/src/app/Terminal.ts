import { Interfaces } from '../interfaces.namespace';

import ascii from '../ascii';
import outputs from '../outputs';

export default abstract class Terminal {
    private static cursorIndex: number = 0;
    private static currentList: (Interfaces.ListingObject | undefined)[] = [];
    private static listedItemCount: number = 0;
    private static printedListingCount: number = 0;

    public static clear(): void {
        process.stdout.write(ascii.CLEARSCREEN)
        // readline.cursorTo(process.stdout, 0, 0);
        // readline.clearScreenDown(process.stdout);
    }

    public static clearCursorToEnd(): void {
        process.stdout.write(ascii.CLEARCURSORTOEND);
    }

    public static clearLine(): void {
        process.stdout.write(ascii.CLEARLINE);
    }

    private static clearList(): void {
        this.prevLineX(this.printedListingCount);
        this.clearCursorToEnd();
    }

    public static hideCursor(): void {
        process.stdout.write(ascii.HIDECURSOR);
    }

    public static showCursor(): void {
        process.stdout.write(ascii.SHOWCURSOR);
    }

    public static prevLine(): void {
        process.stdout.write(ascii.PREVLINE);
    }

    public static nextLine(): void {
        process.stdout.write(ascii.NEXTLINE);
    }

    public static prevLineX(x: number): void {
        process.stdout.write(ascii.PREVLINEX.replace('{x}', x.toString()));
    }

    public static nextLineX(x: number): void {
        process.stdout.write(ascii.NEXTLINEX.replace('{x}', x.toString()));
    }

    public static promptList(arr: (Interfaces.ListingObject | undefined)[], listedItemCount: number): void {
        this.cursorIndex = Math.floor(listedItemCount / 2);
        this.currentList = arr;
        this.listedItemCount = listedItemCount;

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
        if (this.printedListingCount != 0) {
            this.clearList();
        }

        this.printedListingCount = 0;

        let output: string = '';

        for (let i: number = 0; i < this.listedItemCount; i++) {
            let text: string = this.currentList[i]?.text || ' ';

            if (i == this.cursorIndex) {
                output += outputs.HOVEREDOUTPUT.replace('{text}', text);
            } else {
                output += outputs.STANDARTOUTPUT.replace('{text}', text);
            }

            this.printedListingCount++;
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