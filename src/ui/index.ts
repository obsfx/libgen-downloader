import { Interfaces } from './interfaces.namespace';
import { Types } from './types.namespace';

import Main from './modules/Main';
import Terminal from './modules/Terminal';
import EventHandler from './modules/EventHandler';

import List from './components/List';
import Input from './components/Input';

import outputs from './outputs';
import ansi from './ansi';
import constants from './constants';

export {
    Interfaces as UIInterfaces,
    Types as UITypes,

    EventHandler,

    List,
    Input
}

export default {
    Main,
    Terminal,

    outputs,
    ansi,
    constants
}
