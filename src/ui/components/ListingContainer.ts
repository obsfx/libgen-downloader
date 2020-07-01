import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from  '../modules/Colors';

import Component from './Component';

import keymap from '../keymap';

export default abstract class ListingContainer extends Component {
    protected cursorIndex: number = 0;
    protected listLength: number = 0;

    protected terminateAwaiting: boolean = false;
    protected activeAwait: boolean = false;

    protected cursor: string = Colors.get('cyan', '>');
    protected cursorX: number = 0;
    protected cursorY: number = 0;

    protected middleIndex: number = 0;
    protected renderingQueue: Types.Listing[] = [];
    protected paddingLeft: number = 2;

    protected longestTextLength: number = 0;
    protected containerWidth: number = 40;
    protected containerPadding: number = 1;

    protected clearStr: string = ' ';

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

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;

        this.setCursorXY(x, y);
    }

    public setPaddingLeft(paddingLeft: number): void {
        this.paddingLeft = paddingLeft;
    }

    public attachListingArr(listingArr: Types.Listing[], listLength: number): void {
        this.cursorIndex = 0;
        this.listLength = listingArr.length > listLength ? listLength : listingArr.length;
        this.middleIndex = Math.floor(this.listLength / 2);

        this.renderingQueue = listingArr;

        for (let i: number = 0; i < this.renderingQueue.length; i++) {
            if (this.longestTextLength < this.renderingQueue[i].text.length) {
                this.longestTextLength = this.renderingQueue[i].text.length;
            }
        }

        this.containerWidth = Math.max(this.longestTextLength, this.containerWidth);

        this.clearStr = '';

        for (let i: number = 0; i < this.containerWidth + this.paddingLeft; i++) {
            this.clearStr += ' ';
        }
    }

    public prev(): void  {
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

    public next(): void {
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
        Terminal.cursorXY(this.cursorX + this.containerPadding, this.cursorY + this.containerPadding);
        process.stdout.write(this.cursor);
    }

    protected clearCursor(): void {
        Terminal.clearXY(this.cursorX + this.containerPadding, this.cursorY + this.containerPadding);
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
                this.y + this.renderingQueue.length - 1;

            this.clearCursor();
            this.setCursorXY(this.cursorX, y);
        }
    }

    protected nextCursor(): void {
        if (this.renderingQueue.length <= this.listLength || this.cursorY < this.y + this.middleIndex) {
            let y: number = this.cursorY < this.y +this.renderingQueue.length - 1 ?
                this.cursorY + 1 :
                this.y;

            this.clearCursor();
            this.setCursorXY(this.cursorX, y);
        }
    }

    protected clear(): void {
        for (let i: number = 0; i < this.listLength; i++) {
            Terminal.cursorXY(this.x + this.containerPadding, this.y + i + this.containerPadding);
            process.stdout.write(this.clearStr);
        }
    }

    public render(): void {  }

    public show(): void {
        this.renderContainer();
        this.render();
    }

    public renderContainer(): void {
        let w: number = this.containerWidth + this.containerPadding * 2 + this.paddingLeft;
        let h: number = this.listLength + this.containerPadding * 2;

        for (let y: number = 0; y < h; y++) {
            for (let x: number = 0; x < w; x++) {
                if (x == 0 && y == 0) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write('┌');
                } else if (x == w - 1 && y == 0) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write('┐');
                } else if (x == 0 && y == h - 1) { 
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write('└');
                } else if (x == w - 1 && y == h - 1) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write('┘');
                } else if (y == 0 || y == h - 1) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write('─');
                } else if (x == 0 || x == w - 1) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write('│');
                }
            }
        }
    }

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
                    setTimeout(controlLoop);
                }
            }

            controlLoop();
        });
    }
}
