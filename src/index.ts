import cli from './cli';
import { init } from './app';

if (!cli(process.argv)) {
  init();
}
