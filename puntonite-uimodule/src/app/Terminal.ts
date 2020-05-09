import { Interfaces } from '../interfaces.namespace';

import ascii from '../ascii';
import outputs from '../outputs';
import constants from '../constants';

export default abstract class Terminal {
    private static cursorIndex: number = 0;
    private static renderingQueue: Interfaces.ListingObject[] = [];
    private static listedItemCount: number = 0;
    private static printedListingCount: number = 0;

    /*********************************************** */
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

    /*********************************************** */
    public static promptList(arr: Interfaces.ListingObject[], listedItemCount: number): void {
        this.cursorIndex = Math.floor(listedItemCount / 2);
        this.listedItemCount = listedItemCount;

        for (let i: number = 0; i < arr.length; i++) {
            if (arr[i].isCheckable) {
                if (!arr[i].submenu) {
                    arr[i].submenu = [];
                }

                arr[i].submenu?.push({
                    text: arr[i].checkBtnText || ' ',
                    value: constants.CHECKBTNVAL, 
                    isSubmenuListing: true,
                    isCheckable: false
                });
            }

            if (arr[i].submenu) {
                arr[i].submenu?.push({
                    text: arr[i].submenuToggleBtnText || ' ',
                    value: constants.TOGGLECLOSEBTNVAL, 
                    isSubmenuListing: true,
                    isCheckable: false,
                    parentOffset: arr[i].submenu?.length
                });
            }
        }

        this.renderingQueue = arr;

        this.renderList();
    }

    public static prevListing(): void {
        let pop: Interfaces.ListingObject | undefined = this.renderingQueue.pop();

        if (pop) {
            this.renderingQueue.unshift(pop)
        }

        this.renderList();
    }

    public static nextListing(): void {

        let shift: Interfaces.ListingObject | undefined = this.renderingQueue.shift();

        if  (shift) {
            this.renderingQueue.push(shift);
        }

        this.renderList();
    }

    private static renderList(): void {
        if (this.printedListingCount != 0) {
            this.clearList();
        }
        // this.clear();
        this.printedListingCount = 0;

        let output: string = '';

        for (let i: number = 0; i < this.listedItemCount; i++) {
            let text: string = this.renderingQueue[i].text;

            if (i == this.cursorIndex) {
                if (this.renderingQueue[i].isSubmenuListing) {
                    output += outputs.SUBMENUHOVEREDOUTPUT.replace('{text}', text);
                } else if (this.renderingQueue[i].isSubmenuOpen) {
                    output += outputs.TOGGLEDHOVEREDOUTPUT.replace('{text}', text);
                } else {
                    output += outputs.HOVEREDOUTPUT.replace('{text}', text);
                }
            } else if (this.renderingQueue[i].isSubmenuListing){
                output += outputs.SUBMENUOUTPUT.replace('{text}', text);
            } else if (this.renderingQueue[i].isSubmenuOpen) {
                output += outputs.TOGGLEDOUTPUT.replace('{text}', text);
            } else {
                output += outputs.STANDARTOUTPUT.replace('{text}', text);
            }

            this.printedListingCount++;
        }

        process.stdout.write(output);
    }

    public static getCurrentListing(): Interfaces.ListingObject {
        return this.renderingQueue[this.cursorIndex];
    }

    public static toggleSubmenu(): void {
        let currentListing: Interfaces.ListingObject = this.getCurrentListing();
        
        if (currentListing.submenu || currentListing.parentOffset) {
            let targetIndex: number = this.cursorIndex;

            if (currentListing.parentOffset) {
                targetIndex -= currentListing.parentOffset + 1;
            }
            
            let targetListingItem: Interfaces.ListingObject = this.renderingQueue[targetIndex];

            if (targetListingItem.submenu) {
                if (targetListingItem.isSubmenuOpen) {
                    this.renderingQueue.splice(targetIndex + 1, targetListingItem.submenu.length);
                } else {
                    this.renderingQueue.splice(targetIndex + 1, 0, ...targetListingItem.submenu); 
                }

                this.renderingQueue[targetIndex].isSubmenuOpen = !this.renderingQueue[targetIndex].isSubmenuOpen;

                if (currentListing.parentOffset) {
                    for (let i: number = 0; i < targetListingItem.submenu.length; i++) {
                        this.prevListing();
                    }
                }

                this.renderList();
            }
            // console.log(this.printedListingCount);
        }

        //splice(this.cursorIndex + 1, submenu.length)
    }

    /*********************************************** */
    public static promptInput(promptHead: string): void {
        process.stdout.write(promptHead);
    }
}