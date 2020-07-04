import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

export default class Text implements Interfaces.Text {
    x: number;
    y: number;

    text: string;
    renderedtext: string;

    color: Types.color;
    hovercolor: Types.color;

    maxLength: number;
    clearStr: string;

    constructor(text: string, color: Types.color, hovercolor: Types.color) {
        this.x = -1;
        this.y = -1;

        this.text = text;
        this.renderedtext = text;

        this.color = color;
        this.hovercolor = hovercolor;

        this.maxLength = 40;
        this.clearStr = '';
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public setText(text: string): void {
        this.text = text;
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

        if (this.maxLength < this.renderedtext.length) {
            this.renderedtext = `${this.text.substr(0, this.maxLength - 3)}...`;
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
}
