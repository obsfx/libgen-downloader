import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

import Listing from './Listing';

import keymap from '../keymap';

export default class Dropdown extends Listing {
    expanded: boolean;

    prefix: string;
    expandedprefix: string;

    constructor(params: Types.ComponentParams) {
        super(params);

        this.expanded = false;

        this.prefix = '[+]';
        this.expandedprefix = Colors.get('yellow', '[-]');
    }

    public render(hover: boolean = false): void {
        this.text.render(hover);
        this.renderPrefix();
    }

    private renderPrefix(): void {
        Terminal.cursorXY(this.x - (this.prefix.length + 1), this.y);

        let prefix: string = this.expanded ?
            this.expandedprefix :
            this.prefix;

        process.stdout.write(prefix)
    }

    public eventHandler(key: Types.stdinOnKeyParam): boolean {
        if (key.name == keymap.DOACTION) {
            if (this.sublist) {
                this.expanded = false;
                this.sublist.hide();

                this.renderPrefix();
            }
        }

        return !this.expanded;
    }

    public show(): void {
        if (this.sublist) {
            this.expanded = true;

            this.sublist.setXY(this.x, this.y + 1);
            this.sublist.show();

            this.renderPrefix();
        }
    }
}
