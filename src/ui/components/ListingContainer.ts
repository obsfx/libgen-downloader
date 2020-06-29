import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from  '../modules/Colors';

import Component from './Component';

import keymap from '../keymap';

export default abstract class ListingContainer extends Component {
    protected cursorIndex: number = 0;
    protected printedListingCount : number = 0;
    protected listLength: number = 0;

    protected terminateAwaiting: boolean = false;
    protected activeAwait: boolean = false;

    protected cursor: string = Colors.get('cyan', '>');
    protected cursorX: number = 0;
    protected cursorY: number = 0;

    protected middleIndex: number = 0;
    protected renderingQueue: Types.Listing[] = [];
    protected paddingLeft: number = 2;

    constructor() {
        super({
            text: '',
            value: '',
            actionID: '',

            color: 'white',
            hovercolor: 'white'
        });

        this.cursorX = this.x;
        this.cursorY = this.y;
    }

    setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;

        this.cursorX = x;
        this.cursorY = y;
    }

    setPaddingLeft(paddingLeft: number): void {
        this.paddingLeft = paddingLeft;
    }

    public attachListingArr(listingArr: Types.Listing[], listLength: number): void {
        this.cursorIndex = 0;
        this.listLength = listLength;
        this.middleIndex = Math.floor(this.listLength / 2);

        this.renderingQueue = listingArr;

        this.paddingLeft = 2;
    }

    protected prev(): void  {
        if (this.renderingQueue.length <= this.listLength) {
            this.cursorIndex = this.cursorIndex > 0 ?
                this.cursorIndex - 1 :
                this.renderingQueue.length - 1;
        } else {
            let pop: Types.Listing | undefined = this.renderingQueue.pop();

            if (pop) {
                this.renderingQueue.unshift(pop);
            }
        }

        this.prevCursor();
    }

    protected next(): void {
        if (this.renderingQueue.length <= this.listLength || this.cursorIndex < this.middleIndex) {
            this.cursorIndex = this.cursorIndex < this.renderingQueue.length - 1 ?
                this.cursorIndex + 1 :
                0;
        } else {
            let shift: Types.Listing | undefined = this.renderingQueue.shift();

            if (shift) {
                this.renderingQueue.push(shift);
            } 
        }

        this.nextCursor();
    }

    protected renderCursor(): void {
        Terminal.cursorXY(this.cursorX, this.cursorY);
        process.stdout.write(this.cursor);
    }

    protected clearCursor(): void {
        Terminal.clearXY(this.cursorX, this.cursorY);
    }

    protected setCursorColor(cursorColor: Types.color): void {
        this.cursor = Colors.get(cursorColor, this.cursor);
    }

    public setCursorXY(x: number, y: number): void {
        this.cursorX = x;
        this.cursorY = y;
    }

    protected prevCursor(): void {
        if (this.renderingQueue.length <= this.listLength) {
            let y: number = this.cursorY > this.y ?
                this.cursorY - 1 :
                this.renderingQueue.length - 1;

            this.clearCursor();
            this.setCursorXY(this.cursorX, y);
        }
    }

    protected nextCursor(): void {
        if (this.renderingQueue.length <= this.listLength || this.cursorY < this.y + this.middleIndex) {
            let y: number = this.cursorY < this.renderingQueue.length - 1 ?
                this.cursorY + 1 :
                this.y;

            this.clearCursor();
            this.setCursorXY(this.cursorX, y);
        }
    }

    protected clear(): void {
        for (let i: number = 0; i < this.printedListingCount; i++) {
            Terminal.cursorXY(this.x + this.paddingLeft, this.y + i);
            Terminal.clearLine();
        }
    }

    render(): void {  }

    protected getCurrentListing(): Interfaces.ReturnObject {
        let currentListing: Types.Listing = this.renderingQueue[this.cursorIndex];
        
        return {
            value: currentListing.value,
            actionID: currentListing.actionID
        }
    }

    public eventHandler(key: Types.stdinOnKeyParam): void {
        if (key.name == keymap.PREVLISTING) {
            this.prev();
            this.render();
        }

        if (key.name == keymap.NEXTLISTING) {
            this.next();
            this.render();
        }

        if (key.name == keymap.DOACTION && this.activeAwait) {
            this.terminateAwaiting = true;
        }
    }

    public awaitForReturn(): Promise<Interfaces.ReturnObject> {
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
