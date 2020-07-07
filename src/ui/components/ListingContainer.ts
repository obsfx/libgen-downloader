import { Types } from '../types.namespace';

import EventHandler from '../modules/EventHandler';
import Terminal from '../modules/Terminal';
import Colors from  '../modules/Colors';

import Component from './Component';

import keymap from '../keymap';

export default abstract class ListingContainer extends Component {
    protected cursorIndex: number = 0;
    protected listLength: number = 0;

    public terminateAwaiting: boolean = false;
    protected activeAwait: boolean = false;

    protected cursor: string = Colors.get('cyan', '>');
    protected cursorX: number = 0;
    protected cursorY: number = 0;

    protected middleIndex: number = 0;
    public renderingQueue: Types.Listing[] = [];
    protected paddingLeft: number = 2;
    protected containerWidth: number = 40;

    protected completeWidth: number = 40;
    protected currentWidth: number = 0;
    protected currentTextWidth: number = 0;
    protected containerPadding: number = 1;

    protected clearCompStr: string = '';

    constructor(zindex: number) {
        super({
            title: '',
            value: '',
            actionID: '',

            color: 'white',
            hovercolor: 'white'
        });

        this.setZIndex(zindex);

        this.cursorX = this.x;
        this.cursorY = this.y;
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;

        this.setCursorXY(x, y + this.cursorIndex);
    }

    public setPaddingLeft(paddingLeft: number): void {
        this.paddingLeft = paddingLeft;
    }

    public setContainerWidth(width: number): void {
        this.containerWidth = width;
        this.completeWidth = this.containerWidth + this.containerPadding * 2 + this.paddingLeft;
    }

    public attachListingArr(listingArr: Types.Listing[], listLength: number): void {
        this.cursorIndex = 0;
        this.listLength = listingArr.length > listLength ? listLength : listingArr.length;
        this.middleIndex = Math.floor(this.listLength / 2);

        this.renderingQueue = listingArr;

        this.completeWidth = this.containerWidth + this.containerPadding * 2 + this.paddingLeft;
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

    public clearComplete(): void {
        for (let i: number = 0; i < this.listLength + this.containerPadding * 2; i++) {
            Terminal.cursorXY(this.x, this.y + i);
            process.stdout.write(this.clearCompStr);
        }
    }

    public adjustContainer(): void {
        this.currentWidth = this.x + this.completeWidth >= process.stdout.columns - 5 ?
            process.stdout.columns - 5 - this.x :
            this.completeWidth;

        this.currentTextWidth = this.currentWidth - (this.containerPadding * 2 + this.paddingLeft);

        this.clearCompStr = ' '.repeat(Math.abs(this.currentWidth));
    }

    public show(): void {
        EventHandler.rawMode(true);
        EventHandler.attachKeyEvent(this.id, this.eventHandler.bind(this));

        EventHandler.attachResizeReRenderEvent(this.zindex, this.id, this.onResize.bind(this));

        this.adjustContainer();

        for (let i: number = 0; i < this.renderingQueue.length; i++) {
            this.renderingQueue[i].text.setMaxLength(this.currentTextWidth);
            this.renderingQueue[i].text.adjustText();
        }

        this.clearComplete();
        this.renderContainer();
        this.render();
    }

    public hide(): void {
        EventHandler.rawMode(false);
        EventHandler.detachKeyEvent(this.id);

        EventHandler.detachResizeReRenderEventMap(this.zindex, this.id);

        this.clearComplete();
    }

    public renderContainer(): void {
        let w: number = this.currentWidth;
        let h: number = this.listLength + this.containerPadding * 2;

        for (let y: number = 0; y < h; y++) {
            for (let x: number = 0; x < w; x++) {
                if (x == 0 && y == 0) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write(Colors.get('none', '┌'));
                } else if (x == w - 1 && y == 0) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write(Colors.get('none', '┐'));
                } else if (x == 0 && y == h - 1) { 
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write(Colors.get('none', '└'));
                } else if (x == w - 1 && y == h - 1) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write(Colors.get('none', '┘'));
                } else if (y == 0 || y == h - 1) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write(Colors.get('none', '─'));
                } else if (x == 0 || x == w - 1) {
                    Terminal.cursorXY(this.x + x, this.y + y);
                    process.stdout.write(Colors.get('none', '│'));
                }
            }
        }
    }

    public getCurrentListing(): Types.ReturnObject {
        let currentListing: Types.Listing = this.renderingQueue[this.cursorIndex];
        
        return {
            value: currentListing.value,
            actionID: currentListing.actionID
        }
    }

    public setCurrentListingActionID(actionID: string): void {
        this.renderingQueue[this.cursorIndex].actionID = actionID;
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

    public awaitForReturn(): Promise<Types.ReturnObject> {
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
