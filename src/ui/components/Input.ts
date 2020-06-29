import { Interfaces } from '../interfaces.namespace';

import Terminal from '../modules/Terminal';

import readline from 'readline';

export default abstract class Input {
    private static x: number;
    private static y: number;

    private static head: string = '';
    private static returnValue: Interfaces.ReturnObject | null;
    private static rl: readline.Interface;

    public static attach(): void {
        this.x = 0;
        this.y = 0;

        this.returnValue = null;

        this.rl = readline.createInterface({
            input: process.stdin
        });

        this.rl.on('line', (line: string) => {
            this.returnValue = {
                value: line,
                actionID: ' '
            }

            Terminal.prevLine();
            Terminal.clearLine();
        });
    }

    public static detach(): void {
        this.rl.close();
    }

    public static setHead(headstr: string): void {
        this.head = headstr;
    }

    public static setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
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
                    setImmediate(controlLoop);
                }
            }

            controlLoop();
        });
    }
}
