import { Types } from '../types.namespace';

import Component from './Component';

export default class Listing extends Component {
    constructor(params: Types.ComponentParams) {
        super(params);
    }

    public render(hover: boolean = false): void {
        this.text.render(hover);
    }
}
