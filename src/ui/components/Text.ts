import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

import { v4 as uuidv4 } from 'uuid';

export default class Text implements Interfaces.Text {
    id: string;

    x: number;
    y: number;

    text: string;
    renderedtext: string;

    color: Types.color;
    hovercolor: Types.color;

    maxLength: number | null;
    clearStr: string;

    constructor(text: string, color: Types.color, hovercolor: Types.color = 'white') {
        this.id = uuidv4();

        this.x = -1;
        this.y = -1;

        this.text = text;
        this.renderedtext = text;

        this.color = color;
        this.hovercolor = hovercolor;

        this.maxLength = null;
        this.clearStr = ' '.repeat(this.text.length);
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public setText(text: string): void {
        this.text = text;
        this.clearStr = ' '.repeat(this.text.length);
    }

    public setMaxLength(maxlen: number): void {
        this.maxLength = maxlen;
        this.clearStr = ' '.repeat(Math.abs(this.maxLength));
    }

    public setColors(color: Types.color, hovercolor: Types.color): void {
        this.color = color;
        this.color = hovercolor;
    }

    public adjustText(): void {
        this.renderedtext = this.text;

        if (this.maxLength != null) { 
            if (this.maxLength < this.renderedtext.length) {
                this.renderedtext = `${this.text.substr(0, this.maxLength - 3)}...`;
            }
        }
    }

    public render(hover: boolean): void {
        if (this.x != -1 && this.y != - 1) {
            Terminal.cursorXY(this.x, this.y);

            let output: string = hover ? 
                Colors.get(this.hovercolor, this.renderedtext) :
                Colors.get(this.color, this.renderedtext);

            process.stdout.write(output);
        }
    }

    public clear(): void {
        if (this.x != -1 && this.y != -1) {
            Terminal.cursorXY(this.x, this.y);
            process.stdout.write(this.clearStr);
        }
    }

    public onResize(): void {
        let width: number = this.x + this.text.length >= process.stdout.columns - 5 ?
            process.stdout.columns - 5 - this.x : 
            this.text.length;

        this.clear();
        this.setMaxLength(width);
        this.adjustText();
        this.render(false);
    }
}