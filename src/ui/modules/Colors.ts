import { Types } from '../types.namespace';

import ansi from '../ansi';

export default abstract class Color {
    private static map = {
        black: (text: string): string => `${ansi.BLACK}${text}${ansi.RESETCOLOR}`, 
        red: (text: string): string => `${ansi.RED}${text}${ansi.RESETCOLOR}`, 
        green: (text: string): string => `${ansi.GREEN}${text}${ansi.RESETCOLOR}`, 
        yellow: (text: string): string => `${ansi.YELLOW}${text}${ansi.RESETCOLOR}`, 
        blue: (text: string): string => `${ansi.BLUE}${text}${ansi.RESETCOLOR}`, 
        magenta: (text: string): string => `${ansi.MAGENTA}${text}${ansi.RESETCOLOR}`, 
        cyan: (text: string): string => `${ansi.CYAN}${text}${ansi.RESETCOLOR}`, 
        white: (text: string): string => `${ansi.WHITE}${text}${ansi.RESETCOLOR}`, 

        bblack: (text: string): string => `${ansi.BRIGHTBLACK}${text}${ansi.RESETCOLOR}`, 
        bred: (text: string): string => `${ansi.BRIGHTRED}${text}${ansi.RESETCOLOR}`, 
        bgreen: (text: string): string => `${ansi.BRIGHTGREEN}${text}${ansi.RESETCOLOR}`, 
        byellow: (text: string): string => `${ansi.BRIGHTYELLOW}${text}${ansi.RESETCOLOR}`, 
        bblue: (text: string): string => `${ansi.BRIGHTBLUE}${text}${ansi.RESETCOLOR}`, 
        bmagenta: (text: string): string => `${ansi.BRIGHTMAGENTA}${text}${ansi.RESETCOLOR}`, 
        bcyan: (text: string): string => `${ansi.BRIGHTCYAN}${text}${ansi.RESETCOLOR}`, 
        bwhite: (text: string): string => `${ansi.BRIGHTWHITE}${text}${ansi.RESETCOLOR}` 
    }

    public static get(color: Types.color, text: string): string {
        return this.map[color](text);
    }
}
