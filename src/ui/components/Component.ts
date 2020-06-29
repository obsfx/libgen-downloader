import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

export default abstract class Component implements Interfaces.Component {
    x: number;
    y: number;

    text: string;
    value: string;
    actionID: string;

    color: Types.color;
    hovercolor: Types.color;

    constructor(params: Interfaces.ComponentParams) {
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

    render(): void {  }

    expand(): void {  }
}
