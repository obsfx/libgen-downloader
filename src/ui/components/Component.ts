import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import List from '../components/List';

export default abstract class Component implements Interfaces.Component {
    x: number;
    y: number;

    text: string;
    value: string;
    actionID: string;

    color: Types.color;
    hovercolor: Types.color;

    sublist: List | null;

    constructor(params: Interfaces.ComponentParams) {
        this.x = 0;
        this.y = 0;

        this.text = params.text;
        this.value = params.value;
        this.actionID = params.actionID;

        this.color = params.color;
        this.hovercolor = params.hovercolor;
        
        this.sublist = null;
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public attachSublist(sublist: List): void {
        this.sublist = sublist;
    }

    public detachSublist(): void {
        this.sublist = null;
    }

    public render(): void {  }

    public eventHandler(_: Types.stdinOnKeyParam) {  }

    public show(): void {  }
}
