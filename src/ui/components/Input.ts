import { Interfaces } from '../interfaces.namespace';

import Terminal from '../modules/Terminal';

export default abstract class Input {
    private static x: number;
    private static y: number;

    private static head: string = '';
    private static returnValue: Interfaces.ReturnObject | null;

    public static set(x: number, y: number, headstr: string): void {
        this.x = x;
        this.y = y;

        this.head = headstr;

        this.returnValue = null;
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
                    resolve(this.returnValue);
                } else {
                    setTimeout(controlLoop);
                }
            }

            controlLoop();
        });
    }
}
