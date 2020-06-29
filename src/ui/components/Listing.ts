import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

export default class Listing implements Interfaces.Listing {
    x: number;
    y: number;

    text: string;
    value: string;
    actionID: string;

    color: Types.color;
    hovercolor: Types.color;

    constructor(params: Interfaces.ListingParams) {
        this.x = params.x;
        this.y = params.y;

        this.text = params.text;
        this.value = params.value;
        this.actionID = params.actionID;

        this.color = params.color;
        this.hovercolor = params.hovercolor;
    }

    setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    render(hover: boolean = false): void {
        Terminal.cursorXY(this.x, this.y);

        let output: string = hover ? 
            Colors.get(this.hovercolor, this.text) :
            Colors.get(this.color, this.text);

        process.stdout.write(output);
    }
}
