import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import List from '../components/List';

import { v4 as uuidv4 } from 'uuid';

export default abstract class Component implements Interfaces.Component {
    id: string;

    x: number;
    y: number;

    zindex: number;

    text: string;
    value: string;
    actionID: string;

    color: Types.color;
    hovercolor: Types.color;

    sublist: List | null;

    constructor(params: Interfaces.ComponentParams) {
        this.id = uuidv4();

        this.x = 0;
        this.y = 0;

        this.zindex = 0;

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

    public setZIndex(zindex: number): void {
        this.zindex = zindex;
    }

    public attachSublist(sublist: List): void {
        this.sublist = sublist;
    }

    public detachSublist(): void {
        this.sublist = null;
    }

    public render(): void {  }

    public eventHandler(_: Types.stdinOnKeyParam) {  }

    public onResize(): void {
        this.show();
    }

    public show(): void {  }

    public hide(): void {  }
}
