import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import readline from 'readline';

import constants from '../constants';
import keymap from '../keymap';
import Terminal from './Terminal';

export default abstract class Main {
    private static rl: readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    private static state: string | null = null;
    private static returnVal: string | null = null;

    public static init(): void {
        this.initEventHandlers();

        Terminal.clear();
    }

    public static async prompt(promptObject: Interfaces.promptObject | Interfaces.ListObject): Promise<string> {
        if (promptObject.type == 'input') {
            return await this.promptInput(promptObject);
        } else if (promptObject.type == 'list') {
            return await this.promptList(promptObject);
        }

        return ' ';
    }

    public static async promptList(listObject: Interfaces.ListObject): Promise<string> {
        process.stdin.setRawMode(true);
        Terminal.hideCursor();

        this.state = constants.STATE.LIST;
        this.returnVal = null;

        Terminal.promptList(listObject.listings);

        return await this.listenForReturn<string>();
    }

    public static async promptInput(promptObject: Interfaces.promptObject): Promise<string> {
        process.stdin.setRawMode(false);
        Terminal.showCursor();

        this.state = constants.STATE.INPUT;
        this.returnVal = null;

        Terminal.promptInput(promptObject.text);

        return await this.listenForReturn<string>();
    }

    public static promptTable(): void {

    }

    private static initEventHandlers(): void {
        readline.emitKeypressEvents(process.stdin)

        process.stdin.on('keypress', (str: Types.stdinOnStrParam, key: Types.stdinOnKeyParam) => {
            if (this.state == constants.STATE.LIST) {
                if (key.ctrl && key.name == 'c') {
                    Terminal.showCursor();
                    process.exit(0);
                }

                if (key.name == keymap.PREVLISTING) {
                    Terminal.prevListing();   
                }
            
                if (key.name == keymap.NEXTLISTING) {
                    Terminal.nextListing();
                }

                if (key.name == keymap.DOACTION) {
                    this.returnVal = Terminal.getCurrentListing();
                }
            }
        });

        this.rl.on('line', (line: string) => {
            if (this.state == constants.STATE.INPUT) {
                this.returnVal = line;
            }
            Terminal.prevLine();
            Terminal.clearLine();
        });
    }

    private static listenForReturn<T>(): Promise<T> {
        return new Promise((resolve: Function) => {
            const controlLoop = (): void => {
                if (this.returnVal) {
                    resolve(this.returnVal);
                } else {
                    setImmediate(controlLoop);
                }
            }

            controlLoop();
        });
    }
}