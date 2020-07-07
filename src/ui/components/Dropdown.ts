import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

import Listing from './Listing';

import keymap from '../keymap';

export default class Dropdown extends Listing {
    expanded: boolean;

    prefix: string;
    expandedprefix: string;
    checkmark: string;

    /*
     * ADD FOREGROUND ASCII COLORS
     */

    constructor(params: Types.ComponentParams) {
        super(params);

        this.expanded = false;

        this.prefix = '[+]';
        this.expandedprefix = Colors.get('yellow', '[-]');
        this.checkmark = Colors.get('bgreen', 'X');
    }

    public render(hover: boolean = false): void {
        this.text.render(hover);
        this.renderPrefix();
        this.renderCheckmark();
    }

    private renderPrefix(): void {
        Terminal.cursorXY(this.x - (this.prefix.length + 1), this.y);

        let prefix: string = this.expanded ?
            this.expandedprefix :
            this.prefix;

        process.stdout.write(prefix);
    }

    public renderCheckmark(): void {
        Terminal.cursorXY(this.x - (this.prefix.length + 1) - 2, this.y);

        let checkmark: string = this.checked ?
            this.checkmark :
            ' ';

        process.stdout.write(checkmark);
    }

    public toggleChecked(): void {
        this.checked = !this.checked;

        if (this.checked) {
            this.text.setColors('bgreen', 'byellow');
        } else { 
            this.text.setColors('white', 'cyan');
        }

        if (this.sublist) {
            let oldText: string = !this.checked ?
                'Remove from Bulk Downloading Queue' :
                'Add to Bulk Downloading Queue';
            
            let newText: string = this.checked ?
                'Remove from Bulk Downloading Queue' :
                'Add to Bulk Downloading Queue';

            for (let i: number = 0; i < this.sublist.renderingQueue.length; i++) {
                if (this.sublist.renderingQueue[i].text.text == oldText) {
                    this.sublist.renderingQueue[i].text.setText(newText);
                }
            }
        }

        this.render(true);
    }

    public eventHandler(key: Types.stdinOnKeyParam): Types.ReturnObject | null | void {
        if (key.name == keymap.DOACTION) {
            if (this.sublist) {
                this.expanded = false;
                this.sublist.hide();

                this.renderPrefix();

                return this.sublist.getCurrentListing();
            }
        }

        return null;
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
