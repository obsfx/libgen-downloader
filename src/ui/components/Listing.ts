import { Interfaces } from '../interfaces.namespace';

import Component from './Component';

export default class Listing extends Component {
    constructor(params: Interfaces.ComponentParams) {
        super(params);
    }

    public render(hover: boolean = false): void {
        this.text.render(hover);
    }
}
