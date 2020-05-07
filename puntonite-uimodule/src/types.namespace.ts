export namespace Types {
    /**
     * process.stdin params
     */
    export type stdinOnStrParam = string | undefined;
    export type stdinOnKeyParam = {
        sequence: string;
        name: string;
        ctrl: boolean;
        meta: boolean;
        shift: boolean;
        code: boolean;
    }

    /**
     * prompt types
     */
    export type promptObjectType = 'input' | 'list';
}