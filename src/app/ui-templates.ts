import {
    CategorySceneActionIDS,
    ResultsSceneActionIDS
} from './ui-actionids';

import { 
    UIInterfaces,

    Colors 
} from '../ui'

/* ******************************************* */
export const Input = {
    x: 1,
    y: 5,
    title: `${Colors.get('cyan', '?')} Search: `
}

/* ******************************************* */
export const CategorySceneList = {
    x: 2, 
    y: 5
}

export const CategorySceneListings: UIInterfaces.ComponentParams[] = [
    {
        title: 'libgen',
        value: '',
        actionID: CategorySceneActionIDS.LIBGEN,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'libgen/fiction',
        value: '',
        actionID: CategorySceneActionIDS.LIBGEN_FICTION,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'libgen/comics',
        value: '',
        actionID: CategorySceneActionIDS.LIBGEN_COMICS,
        color: 'white',
        hovercolor: 'cyan'
    }
]

/* ******************************************* */
export const ResultsSceneList = {
    x: 2,
    y: 5,
    containerWidth: 60
}

export const ResultsSceneListings: UIInterfaces.ComponentParams[]  = [
    {
        title: 'See Details',
        value: '',
        actionID: ResultsSceneActionIDS.SEE_DETAILS,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'Download Directly',
        value: '',
        actionID: ResultsSceneActionIDS.SEE_DETAILS,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'Add to Bulk Downloading Queue',
        value: '',
        actionID: ResultsSceneActionIDS.ADD_TO_BULK_DOWNLOADING_QUEUE,
        color: 'yellow',
        hovercolor: 'cyan'
    },

    {
        title: 'Turn Back to The List',
        value: '',
        actionID: ResultsSceneActionIDS.TURN_BACK_TO_THE_LIST,
        color: 'white',
        hovercolor: 'cyan'
    }
]
