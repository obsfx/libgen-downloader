import { Interfaces } from '../interfaces.namespace';

import EventHandler from '../modules/EventHandler';
import Terminal from '../modules/Terminal';

import { v4 as uuidv4 } from 'uuid';

export default abstract class Input {
    private static id: string = uuidv4();

    private static x: number;
    private static y: number;

    private static head: string = '';
    private static returnValue: Interfaces.ReturnObject | null;

    public static set(x: number, y: number, headstr: string): void {
        this.x = x;
        this.y = y;

        this.head = headstr;

        this.returnValue = null;

        EventHandler.attachOnLineEvent(this.id, this.eventHandler.bind(this));
    }

    public static eventHandler(line: string) {
        this.returnValue = {
            value: line,
            actionID: ' '
        }

        Terminal.prevLine();
        Terminal.clearLine();
    }

    public static render(): void {
        Terminal.cursorXY(this.x, this.y);
        process.stdout.write(this.head);
    }

    public static awaitForReturn(): Promise<Interfaces.ReturnObject> {
        return new Promise((resolve: Function) => {
            const controlLoop = (): void => {
                if (this.returnValue) {
                    EventHandler.detachOnLineEvent(this.id);
                    resolve(this.returnValue);
                } else {
                    setTimeout(controlLoop);
                }
            }

            controlLoop();
        });
    }
}
