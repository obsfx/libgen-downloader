import ACTIONID from './action-ids';

import { UITypes } from '../ui'

/* ******************************************* */
export const CategorySceneListings: UITypes.ComponentParams[] = [
    {
        title: 'libgen',
        value: 'libgen',
        actionID: ACTIONID.LIBGEN,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'libgen/fiction',
        value: 'libgen/fiction',
        actionID: ACTIONID.LIBGEN_FICTION,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'libgen/comics',
        value: 'libgen/comics',
        actionID: ACTIONID.LIBGEN_COMICS,
        color: 'white',
        hovercolor: 'cyan'
    }
]


/* ******************************************* */
export const ResultsSceneOptionListings: UITypes.ComponentParams[] = [
    {
        title: 'Search',
        value: '',
        actionID: ACTIONID.SEARCH,
        color: 'yellow',
        hovercolor: 'cyan'
    },

    {
        title: '→ Next Page',
        value: '',
        actionID: ACTIONID.NEXT_PAGE,
        color: 'yellow',
        hovercolor: 'cyan'
    },

    {
        title: '← Previous Page',
        value: '',
        actionID: ACTIONID.PREV_PAGE,
        color: 'yellow',
        hovercolor: 'cyan'
    },

    {
        title: '@ Start Bulk Downloading',
        value: '',
        actionID: ACTIONID.START_BULK,
        color: 'green',
        hovercolor: 'cyan'
    },

    {
        title: 'X EXIT',
        value: '',
        actionID: ACTIONID.EXIT,
        color: 'red',
        hovercolor: 'cyan'
    }
]

export const ResultsSceneSubListings: UITypes.ComponentParams[] = [
    {
        title: 'See Details',
        value: '',
        actionID: ACTIONID.SEE_DETAILS,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'Download Directly',
        value: '',
        actionID: ACTIONID.DOWNLOAD_DIRECTLY,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'Add to Bulk Downloading Queue',
        value: '',
        actionID: ACTIONID.ADD_TO_BULK_DOWNLOADING_QUEUE,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'Turn Back to The List',
        value: '',
        actionID: ACTIONID.TURN_BACK_TO_THE_LIST,
        color: 'white',
        hovercolor: 'cyan'
    }
]

/* ******************************************* */
export const EntryDetailsSceneOptions: UITypes.ComponentParams[] = [
    {
        title: 'Turn Back to The List',
        value: '',
        actionID: ACTIONID.TURN_BACK_TO_THE_LIST,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'Download Directly',
        value: '',
        actionID: ACTIONID.DOWNLOAD_DIRECTLY,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'Add to Bulk Downloading Queue',
        value: '',
        actionID: ACTIONID.ADD_TO_BULK_DOWNLOADING_QUEUE,
        color: 'white',
        hovercolor: 'cyan'
    },
]

/* ******************************************* */
export const SearchAnotherSceneOptions: UITypes.ComponentParams[] = [
    {
        title: 'Search Another',
        value: '',
        actionID: ACTIONID.SEARCH_ANOTHER,
        color: 'white',
        hovercolor: 'cyan'
    },

    {
        title: 'X Exit',
        value: '',
        actionID: ACTIONID.EXIT,
        color: 'white',
        hovercolor: 'cyan'
    },
]
