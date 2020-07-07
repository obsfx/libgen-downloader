import { Types } from '../types.namespace';

import List from '../components/List';
import Text from '../components/Text';

import { v4 as uuidv4 } from 'uuid';

type TComponent = {
    title: string;
    value: string;
    actionID: string;

    color: Types.color;
    hovercolor: Types.color;

    checked: boolean;

    id: string;

    text: Text;

    x: number;
    y: number;

    zindex: number;

    sublist: List | null;

    setXY(x: number, y: number): void;
    setZIndex(zindex: number): void;

    attachSublist(sublist: List): void;
    detachSublist(): void;

    render(hover: boolean): void;

    eventHandler(key: Types.stdinOnKeyParam): (void | boolean);
    onResize(): void;

    show(): void;
    hide(): void;

    clearPrefix(): void;
    clearCheckmark(): void;
}

export default abstract class Component implements TComponent {
    title: string;
    value: string;
    actionID: string;

    color: Types.color;
    hovercolor: Types.color;

    checked: boolean;

    id: string;

    text: Text;

    x: number;
    y: number;

    zindex: number;

    sublist: List | null;

    constructor(params: Types.ComponentParams) {
        this.id = uuidv4();

        this.x = 0;
        this.y = 0;

        this.zindex = 0;

        this.color = params.color;
        this.hovercolor = params.hovercolor;

        this.title = params.title;
        this.text = new Text(this.title, this.color, this.hovercolor);

        this.value = params.value;
        this.actionID = params.actionID;

        this.checked = false;

        this.sublist = null;
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;

        this.text.setXY(this.x, this.y);
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

    public toggleChecked(): void {  }

    public clearPrefix(): void {  }
    public clearCheckmark(): void {  }
}
