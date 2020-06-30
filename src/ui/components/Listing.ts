import { Interfaces } from '../interfaces.namespace';

import Terminal from '../modules/Terminal';
import Colors from '../modules/Colors';

import Component from './Component';

export default class Listing extends Component {
    constructor(params: Interfaces.ComponentParams) {
        super(params);
    }

    public render(hover: boolean = false): void {
        Terminal.cursorXY(this.x, this.y);

        let output: string = hover ? 
            Colors.get(this.hovercolor, this.text) :
            Colors.get(this.color, this.text);

        process.stdout.write(output);
    }
}
