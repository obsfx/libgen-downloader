import ascii from './ascii';

const OUTPUTS = {
    STANDARTPREFIX: '  ',
    HOVERPREFIX: ' >',
    
    CHECKED: ' ▀',
    UNCHECKED: ' ─',

    STANDARTOUTPUT: '',
    HOVEREDOUTPUT: ''
}

OUTPUTS.STANDARTOUTPUT = `${OUTPUTS.STANDARTPREFIX} {text}\n`
OUTPUTS.HOVEREDOUTPUT = `${ascii.CYAN}${OUTPUTS.HOVERPREFIX} {text}${ascii.RESETCOLOR}\n`

export default OUTPUTS;