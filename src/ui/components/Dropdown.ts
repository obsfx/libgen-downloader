import {Types} from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

import ListingContainer from './ListingContainer';

export default class Dropdown extends ListingContainer {
    prefix: string;
    hoverprefix: string;
    expandedprefix: string;

    expanded: boolean;

    text: string;

    color: Types.color;
    hovercolor: Types.color;

    constructor() {
        super();

        this.prefix = '+';
        this.hoverprefix = '+';
        this.expandedprefix = '─';

        this.expanded = false;

        this.text = ' ';

        this.color = 'white';
        this.hovercolor = 'cyan';
    }

    setText(text: string): void {
        this.text = text;
    }

    public render(hover: boolean = false): void {
        Terminal.cursorXY(this.x, this.y);

        let output: string = hover ? 
            Colors.get(this.hovercolor, this.text) :
            Colors.get(this.color, this.text);

        let prefix: string = this.expanded ?
            this.expandedprefix : 
            hover ? this.hoverprefix : this.prefix;

        process.stdout.write(`${prefix} ${output}`);
    }

    async expand(): Promise<void> {
        /*
         * TODO: make cursor separate. means when cursor moves
         * only cursour should be rendered not the entire list.
         * find a way to clear only 1 char at specific row col 
         * position
         */
    }
}
