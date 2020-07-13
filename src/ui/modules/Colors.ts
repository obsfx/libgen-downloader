import { Types } from '../types.namespace';

import ansi from '../ansi';

export default abstract class Color {
    private static delimeter: string = '#';
    private static sign: string = '$';

    private static ansiarr: string[] = [
        ansi.RESETCOLOR,

        ansi.BLACK, 
        ansi.RED,
        ansi.GREEN,
        ansi.YELLOW,
        ansi.BLUE,
        ansi.MAGENTA,
        ansi.CYAN,
        ansi.WHITE,

        ansi.BRIGHTBLACK,
        ansi.BRIGHTRED,
        ansi.BRIGHTGREEN,
        ansi.BRIGHTYELLOW,
        ansi.BRIGHTBLUE,
        ansi.BRIGHTMAGENTA,
        ansi.BRIGHTCYAN,
        ansi.BRIGHTWHITE
    ];

    private static map = {
        none: (text: string): string => `${ansi.RESETCOLOR}${text}`,

        black: (text: string): string => `${ansi.RESETCOLOR}${ansi.BLACK}${text}`, 
        red: (text: string): string => `${ansi.RESETCOLOR}${ansi.RED}${text}`, 
        green: (text: string): string => `${ansi.RESETCOLOR}${ansi.GREEN}${text}`, 
        yellow: (text: string): string => `${ansi.RESETCOLOR}${ansi.YELLOW}${text}`, 
        blue: (text: string): string => `${ansi.RESETCOLOR}${ansi.BLUE}${text}`, 
        magenta: (text: string): string => `${ansi.RESETCOLOR}${ansi.MAGENTA}${text}`, 
        cyan: (text: string): string => `${ansi.RESETCOLOR}${ansi.CYAN}${text}`, 
        white: (text: string): string => `${ansi.RESETCOLOR}${ansi.WHITE}${text}`, 

        bblack: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTBLACK}${text}`, 
        bred: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTRED}${text}`, 
        bgreen: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTGREEN}${text}`, 
        byellow: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTYELLOW}${text}`, 
        bblue: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTBLUE}${text}`, 
        bmagenta: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTMAGENTA}${text}`, 
        bcyan: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTCYAN}${text}`, 
        bwhite: (text: string): string => `${ansi.RESETCOLOR}${ansi.BRIGHTWHITE}${text}` 
    }

    public static get(color: Types.color, text: string): string {
        return this.map[color](text);
    }

    public static purify(text: string): string {
        for (let i: number = 0; i < this.ansiarr.length; i++) {
            text = text.split(this.ansiarr[i]).join('');
        }

        return text;
    }

    public static explode(text: string): string[] {
        for (let i: number = 0; i < this.ansiarr.length; i++) {
            while (text.includes(this.ansiarr[i])) {
                text = text.replace(this.ansiarr[i], `${this.delimeter}${this.sign}${i.toString()}${this.delimeter}`);
            }
        }

        return text.split(this.delimeter);
    }

    public static reCreateColoredText(explodedText: string[], length: number): string {
        let remainingChars: number = length;
        let text: string = '';

        for (let i: number = 0; i < explodedText.length; i++) {
            let piece: string = explodedText[i];

            if (piece[0] == this.sign) {
                let color: string = this.ansiarr[Number(piece.substr(1))]
                text += color;
            } else if (remainingChars > 0) {
                text += piece.substr(0, remainingChars);

                remainingChars -= remainingChars > piece.length ?
                    piece.length :
                    remainingChars;

                if (remainingChars < 1) {
                    break;
                }
            }
        }

        return text;
    }
}
