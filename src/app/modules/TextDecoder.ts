import { 
    UITypes,

    Text
} from '../../ui';

export const textDecoder = (textobj: 
    (string | UITypes.coloredText | (string | UITypes.coloredText)[])[] | 
    string | 
    UITypes.coloredText): Text[] => {

    let Texts: Text[] = []

    if (Array.isArray(textobj)) {
        for (let i: number = 0; i < textobj.length; i++) {
            if (Array.isArray(textobj[i])) {
                Texts 
            }
        }

    } else if (typeof textobj == 'string') {

    }

    return Texts;
}

