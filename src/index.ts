import cli from './cli';

import minimist from 'minimist';

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));

cli(argv);
