import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from  '../modules/Colors';

import keymap from '../keymap';

export default abstract class ListingContainer {
    protected x: number = 0;
    protected y: number = 0;

    protected cursorIndex: number = 0;
    protected printedListingCount : number = 0;
    protected listLength: number = 0;

    protected terminateAwaiting: boolean = false;
    protected activeAwait: boolean = false;

    protected cursor: string = Colors.get('cyan', '>');

    protected middleIndex: number = 0;
    protected renderingQueue: Interfaces.Listing[] = [];
    protected paddingLeft: number = 1;

    constructor() {  }

    protected setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    protected attachListingArr(listingArr: Interfaces.Listing[], listLength: number): void {
        this.cursorIndex = 0;
        this.listLength = listLength;
        this.middleIndex = Math.floor(this.listLength / 2);

        this.renderingQueue = listingArr;

        this.paddingLeft = 1;
    }

    protected setCursorColor(cursorColor: Types.color): void {
        this.cursor = Colors.get(cursorColor, this.cursor);
    }

    protected renderCursor(): void {
        Terminal.cursorXY(this.x, this.cursorIndex);
        process.stdout.write(this.cursor);
    }

    protected prev(fn: Function | null = null): void  {
        if (this.renderingQueue.length <= this.listLength) {
            this.cursorIndex = this.cursorIndex > 0 ?
                this.cursorIndex-- :
                this.renderingQueue.length - 1;
        } else {
            let pop: Interfaces.Listing | undefined = this.renderingQueue.pop();

            if (pop) {
                this.renderingQueue.unshift(pop);
            }
        }

        if (fn) {
            fn();
        }
    }

    protected next(fn: Function | null = null): void {
        if (this.renderingQueue.length <= this.listLength || this.cursorIndex < this.middleIndex) {
            this.cursorIndex = this.cursorIndex < this.renderingQueue.length - 1 ?
                this.cursorIndex++ :
                0;
        } else {
            let shift: Interfaces.Listing | undefined = this.renderingQueue.shift();

            if (shift) {
                this.renderingQueue.push(shift);
            } 
        }

        if (fn) {
            fn();
        }
    }

    protected clear(): void {
        for (let i: number = 0; i < this.printedListingCount; i++) {
            Terminal.cursorXY(this.x + this.paddingLeft, this.y + i);
            Terminal.clearLine();
        }
    }

    protected render(): void {  }

    protected getCurrentListing(): Interfaces.ReturnObject {
        let currentListing: Interfaces.Listing = this.renderingQueue[this.cursorIndex];
        
        return {
            value: currentListing.value,
            actionID: currentListing.actionID
        }
    }

    protected eventHandler(key: Types.stdinOnKeyParam): void {
        if (key.name == keymap.PREVLISTING) {
            this.prev();
        }

        if (key.name == keymap.NEXTLISTING) {
            this.next();
        }

        if (key.name == keymap.DOACTION && this.activeAwait) {
            this.terminateAwaiting = true;
        }
    }

    protected awaitForReturn(): Promise<Interfaces.ReturnObject> {
        this.terminateAwaiting = false;
        this.activeAwait = true;

        return new Promise((resolve: Function) => {
            const controlLoop = (): void => {
                if (this.terminateAwaiting) {
                    this.activeAwait = false;
                    resolve(this.getCurrentListing());
                } else {
                    setImmediate(controlLoop);
                }
            }

            controlLoop();
        });
    }
}
