import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Color from '../modules/Colors';

export default class Listing implements Interfaces.Listing {
    x: number;
    y: number;

    text: string;
    value: string;
    actionID: string;

    color: Types.color;
    hovercolor: Types.color;

    prefix: string;
    hoverprefix: string;

    constructor(params: Interfaces.Listing) {
        this.x = params.x;
        this.y = params.y;

        this.text = params.text;
        this.value = params.value;
        this.actionID = params.actionID;

        this.color = params.color;
        this.hovercolor = params.hovercolor;

        this.prefix = params.prefix;
        this.hoverprefix = params.hoverprefix;
    }

    setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    render(hover: boolean = false): void {
        Terminal.cursorXY(this.x, this.y);

        let output: string = hover ? 
            Color.get(this.hovercolor, this.text) :
            Color.get(this.color, this.text);

        let prefix: string = hover ?
            this.hoverprefix :
            this.prefix;

        process.stdout.write(`${prefix}${output}`);
    }
}
