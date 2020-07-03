import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';

import readline from 'readline';

export default abstract class EventHandler {
    private static rl: readline.Interface = readline.createInterface({
        input: process.stdin
    });

    private static keyEventMap: Map<string, Function> = new Map();
    private static onLineEventMap: Map<string, Function> = new Map();
    private static resizeReRenderEventMapArr: Map<string, Function>[] = [];

    public static init(): void {
        process.stdin.on('keypress', (_: Types.stdinOnStrParam, key: Types.stdinOnKeyParam) => {
            if (key.ctrl && key.name == 'c') {
                Terminal.showCursor();
                process.exit(0);
            }

            for (let fn of this.keyEventMap.values()) {
                fn(key);
            }
        });

        this.rl.on('line', (line: string) => {
            for (let fn of this.onLineEventMap.values()) {
                fn(line);
            }
        });

        process.stdout.on('resize', () => {
            Terminal.cursorXY(0, 0);
            Terminal.clearCursorToEnd();

            for (let i: number = 0; i < this.resizeReRenderEventMapArr.length; i++) {
                let map: Map<string, Function> | undefined = this.resizeReRenderEventMapArr[i];

                if (map) {
                    for (let fn of map.values()) {
                        fn();
                    }
                }
            }
        });
    }

    public static rawMode(mode: boolean): void {
        process.stdin.setRawMode(mode);
    }

    public static emitKeypressEvents(): void {
        readline.emitKeypressEvents(process.stdin);
    }

    /* ************************************* */
    public static attachKeyEvent(key: string, fn: Function): void {
        this.keyEventMap.set(key, fn);
    }

    public static detachKeyEvent(key: string): void {
        this.keyEventMap.delete(key);
    }

    /* ************************************* */
    public static attachOnLineEvent(key: string, fn: Function): void {
        this.onLineEventMap.set(key, fn);
    }

    public static detachOnLineEvent(key: string): void {
        this.onLineEventMap.delete(key);
    }

    /* ************************************* */
    public static attachResizeReRenderEvent(zindex: number, key: string, fn: Function): void {
        if (!this.resizeReRenderEventMapArr[zindex]) {
            this.resizeReRenderEventMapArr[zindex] = new Map();
        }

        this.resizeReRenderEventMapArr[zindex].set(key, fn);
    }

    public static detachResizeReRenderEventMap(zindex: number, key: string): void {
        if (this.resizeReRenderEventMapArr[zindex]) {
            this.resizeReRenderEventMapArr[zindex].delete(key);
        }
    }
}
