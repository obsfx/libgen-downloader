import { Interfaces } from '../interfaces.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

import Listing from './Listing';

export default class Dropdown extends Listing {
    dropdownlist: Interfaces.Listing[];

    prefix: string;
    hoverprefix: string;
    expandedprefix: string;

    expanded: boolean;

    constructor(params: Interfaces.DropdownParams) {
        super({
            x: params.x,
            y: params.y,

            text: params.text,
            value: params.value,
            actionID: params.actionID,

            color: params.color,
            hovercolor: params.hovercolor
        });

        this.dropdownlist = params.dropdownlist;

        this.prefix = '+';
        this.hoverprefix = '+';
        this.expandedprefix = '─';

        this.expanded = false;
    }

    render(hover: boolean = false): void {
        Terminal.cursorXY(this.x, this.y);

        let output: string = hover ? 
            Colors.get(this.hovercolor, this.text) :
            Colors.get(this.color, this.text);

        let prefix: string = this.expanded ?
            this.expandedprefix : 
            hover ? this.hoverprefix : this.prefix;

        process.stdout.write(`${prefix} ${output}`);
    }
}
