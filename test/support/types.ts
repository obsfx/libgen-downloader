export interface Sleeper {
  wakeAt: number;
  resolve: () => void;
}
