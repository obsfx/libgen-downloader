import { Interfaces } from '../interfaces.namespace';

import ascii from '../ascii';
import outputs from '../outputs';
import constants from '../constants';

export default abstract class Terminal {
    public static checkedItemsHashTable: Interfaces.TerminalCheckedItemsHashTable = {};

    private static cursorIndex: number = 0;
    private static middleIndex: number = 0;
    private static renderingQueue: Interfaces.ListingObject[] = [];
    private static listedItemCount: number = 0;
    private static printedListingCount: number = 0;
    private static checkedItemsIndicatorText: string = '';

    private static isBulkDownloadOptionAdded: boolean = false;
    private static bulkDownloadOptionPosition: number = 0;
    private static bulkDownloadOptionText: string = '';

    /*********************************************** */
    public static clear(): void {
        process.stdout.write(ascii.CLEARSCREEN)
    }

    public static clearCursorToEnd(): void {
        process.stdout.write(ascii.CLEARCURSORTOEND);
    }

    public static saveCursorPos(): void {
        process.stdout.write(ascii.SAVECURSORPOS);
    }

    public static restoreCursorPos(): void {
        process.stdout.write(ascii.RESTORECURSORPOS);
    }

    public static clearLine(): void {
        process.stdout.write(ascii.CLEARLINE);
    }

    public static turnBackToBeginningOfLine(): void {
        process.stdout.write(ascii.TURNBACKTOBEGINNINGOFLINE);
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
    public static promptList(arr: Interfaces.ListingObject[], listedItemCount: number, addBulkDownloadOption: boolean = false): void {
        this.cursorIndex = 0;
        this.printedListingCount = 0;
        this.middleIndex = Math.floor(listedItemCount / 2);
        this.listedItemCount = listedItemCount;
        this.renderingQueue = arr;
        this.isBulkDownloadOptionAdded = addBulkDownloadOption;

        for (let i: number = 0; i < this.renderingQueue.length; i++) {
            if (this.renderingQueue[i].isCheckable) {
                if (!this.renderingQueue[i].submenu) {
                    this.renderingQueue[i].submenu = [];
                }

                this.renderingQueue[i].submenu?.push({
                    text: (this.checkedItemsHashTable[this.renderingQueue[i].value] ? 
                        this.renderingQueue[i].unCheckBtnText : this.renderingQueue[i].checkBtnText) || ' ',
                    actionID: constants.CHECKBTNVAL, 
                    value: '',
                    isSubmenuListing: true,
                    isCheckable: false,
                    parentOffset: this.renderingQueue[i].submenu?.length
                });
            }

            if (this.renderingQueue[i].submenu) {
                this.renderingQueue[i].submenu?.push({
                    text: this.renderingQueue[i].submenuToggleBtnText || ' ',
                    actionID: constants.TOGGLECLOSEBTNVAL, 
                    value: '',
                    isSubmenuListing: true,
                    isCheckable: false,
                    parentOffset: this.renderingQueue[i].submenu?.length
                });
            }
        }
        
        if (this.isBulkDownloadOptionAdded) {
            this.renderingQueue.splice(this.bulkDownloadOptionPosition, 0, {
                text: '',
                actionID: constants.DOWNLOADBULKVAL,
                value: '',
                isSubmenuListing: false,
                isCheckable: false
            });
    
            this.updateBulkDownloadOptionText();
        }

        this.renderList();
    }

    public static prevListing(): void {
        if (this.renderingQueue.length <= this.listedItemCount) {
            this.cursorIndex = this.cursorIndex > 0 ? this.cursorIndex -= 1 : this.renderingQueue.length - 1;
        } else {
            let pop: Interfaces.ListingObject | undefined = this.renderingQueue.pop();

            if (pop) {
                this.renderingQueue.unshift(pop);

                if (this.isBulkDownloadOptionAdded) {
                    this.bulkDownloadOptionPosition = this.bulkDownloadOptionPosition < this.renderingQueue.length - 1 ?
                    this.bulkDownloadOptionPosition += 1 : 0;
                }
            }
        }

        if (this.cursorIndex == this.bulkDownloadOptionPosition 
            && this.getCheckedListingsCount() < 1
            && this.isBulkDownloadOptionAdded) {
            this.prevListing();
        }

        this.renderList();
    }

    public static nextListing(): void {
        if (this.renderingQueue.length <= this.listedItemCount || this.cursorIndex < this.middleIndex) { 
            this.cursorIndex = this.cursorIndex < this.renderingQueue.length - 1 ? this.cursorIndex += 1 : 0;
        } else {
            let shift: Interfaces.ListingObject | undefined = this.renderingQueue.shift();

            if  (shift) {
                this.renderingQueue.push(shift);

                if (this.isBulkDownloadOptionAdded) {
                    this.bulkDownloadOptionPosition = this.bulkDownloadOptionPosition > 0 ?
                    this.bulkDownloadOptionPosition -= 1 :
                    this.renderingQueue.length - 1;
                }
            }
        }

        if (this.cursorIndex == this.bulkDownloadOptionPosition 
            && this.getCheckedListingsCount() < 1
            && this.isBulkDownloadOptionAdded) {
            this.nextListing();
        }

        this.renderList();
    }

    private static renderList(): void {
        if (this.printedListingCount != 0) {
            this.restoreCursorPos();
            this.clearCursorToEnd();
        }

        this.saveCursorPos();
        this.printedListingCount = 0;

        let listSize = this.renderingQueue.length >= this.listedItemCount ? 
        this.listedItemCount : this.renderingQueue.length;

        let output: string = '';

        for (let i: number = 0; i < listSize; i++) {
            let text: string = this.renderingQueue[i].text;

            if (this.checkedItemsHashTable[this.renderingQueue[i].value] && !this.renderingQueue[i].isSubmenuListing) {
                output += outputs.CHECKED;
            } else {
                output += outputs.UNCHECKED;
            }

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
            } else if (this.checkedItemsHashTable[this.renderingQueue[i].value] && !this.renderingQueue[i].isSubmenuListing) { 
                output += outputs.CHECKEDOUTPUT.replace('{text}', text);
            } else {
                output += outputs.STANDARTOUTPUT.replace('{text}', text);
            }

            this.printedListingCount++;
        }

        this.renderBulkQueueIndicator();
        process.stdout.write(output);
        process.stdout.write(outputs.USAGE_INFO);
        process.stdout.write(this.bulkDownloadOptionPosition.toString());
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

                    if (this.cursorIndex < this.bulkDownloadOptionPosition) {
                        this.bulkDownloadOptionPosition -= targetListingItem.submenu.length;
                    }
                } else {
                    this.renderingQueue.splice(targetIndex + 1, 0, ...targetListingItem.submenu);
                    if (this.cursorIndex < this.bulkDownloadOptionPosition) { 
                        this.bulkDownloadOptionPosition += targetListingItem.submenu.length;
                    }
                }

                this.renderingQueue[targetIndex].isSubmenuOpen = !this.renderingQueue[targetIndex].isSubmenuOpen;

                if (currentListing.parentOffset) {
                    for (let i: number = 0; i < targetListingItem.submenu.length; i++) {
                        this.prevListing();
                    }
                }

                this.renderList();
            }
        }
    }

    public static toggleCheck(): void {
        let currentListing: Interfaces.ListingObject = this.getCurrentListing();

        if (currentListing.parentOffset) {
            let targetIndex: number = this.cursorIndex - (currentListing.parentOffset + 1);

            let targetListingItem: Interfaces.ListingObject = this.renderingQueue[targetIndex];

            this.toggleCheckHashMap(targetListingItem.value);
            
            if (this.isBulkDownloadOptionAdded) {
                this.updateBulkDownloadOptionText();
            }

            this.renderingQueue[this.cursorIndex].text = this.checkedItemsHashTable[targetListingItem.value] ? 
            this.renderingQueue[targetIndex].unCheckBtnText || '': 
            this.renderingQueue[targetIndex].checkBtnText || '';

            this.renderList();
        }
    }

    public static toggleCheckHashMap(hash: string): void {
        if (this.checkedItemsHashTable[hash]) {
            delete this.checkedItemsHashTable[hash];
        } else {
            this.checkedItemsHashTable[hash] = true
        }
    }

    public static getCheckedListingsCount(): number {
        return Object.keys(this.checkedItemsHashTable).length
    }

    /*********************************************** */
    public static promptInput(promptHead: string): void {
        this.renderBulkQueueIndicator();
        process.stdout.write(promptHead);
    }

    /*********************************************** */
    public static setIndicatorText(text: string): void {
        this.checkedItemsIndicatorText = text;
    }

    /*********************************************** */
    public static renderBulkQueueIndicator(): void {
        if (this.getCheckedListingsCount() < 1) {
            process.stdout.write(outputs.EMPTY_BULK_QUEUE.replace('{text}', this.checkedItemsIndicatorText));
        } else {
            process.stdout.write(
                outputs.BULK_QUEUE.replace(
                    '{queuelength}', 
                    this.getCheckedListingsCount().toString()
                ).replace(
                    '{text}',
                    this.checkedItemsIndicatorText
                )
            );
        }
    }

     /*********************************************** */
    public static setBulkDownloadOptionPosition(index: number): void {
        this.bulkDownloadOptionPosition = index;
    }

    public static setBulkDownloadOptionText(text: string): void {
        this.bulkDownloadOptionText = text;
    }

    public static updateBulkDownloadOptionText(): void {
        if (this.getCheckedListingsCount() > 0) {
            this.renderingQueue[this.bulkDownloadOptionPosition].text = outputs.BULK_DOWNLOAD_TEXT_TEMPLATE
                                                                        .replace('{text}', this.bulkDownloadOptionText)
                                                                        .replace('{queuelength}', this.getCheckedListingsCount().toString());
        } else {
            this.renderingQueue[this.bulkDownloadOptionPosition].text = outputs.BULK_DOWNLOAD_TEXT_EMPTY_TEMPLATE
                                                                        .replace('{text}', this.bulkDownloadOptionText);
        }
    }
}