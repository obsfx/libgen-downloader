import { Interfaces } from './interfaces.namespace';
import { Types } from './types.namespace';

import Main from './modules/Main';
import Terminal from './modules/Terminal';

import outputs from './outputs';
import ansi from './ansi';
import constants from './constants';

export {
    Interfaces as UIInterfaces,
    Types as UITypes
}

export default {
    Main,
    Terminal,

    outputs,
    ansi,
    constants
}