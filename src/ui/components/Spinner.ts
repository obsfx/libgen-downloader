import { 
    Terminal,
    EventHandler,
    Text
} from '../../ui'

export default class Spinner {
    private x: number;
    private y: number;

    private title: string;

    private spinning: boolean;

    private spinner: string;

    private spinnerIndex: number;

    private output: Text;

    constructor() {
        this.x = 0;
        this.y = 0;

        this.title = '';

        this.spinning = false;

        this.spinner = '|/-\\';

        this.spinnerIndex = 0;

        this.output = new Text('', 'none');
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;

        this.output.setXY(this.x, this.y);
    }

    public setSpinnerTitle(title: string): void {
        this.title = title;
    }

    public start(logmode: boolean = false): void {
        this.spinning = true;

        if (!logmode) {
            EventHandler.attachResizeReRenderEvent(0, this.output.id, this.output.onResize.bind(this.output));
        }

        const loop: Function = (): void => {
            this.spinnerIndex = ++this.spinnerIndex % this.spinner.length;

            let output: string = this.title.replace('%s', this.spinner[this.spinnerIndex]);

            if (!logmode) {
                this.output.setText(output);
                this.output.onResize();
            } else {
                Terminal.turnBackToBeginningOfLine();
                Terminal.clearLine();
                process.stdout.write(output);
            }

            if (this.spinning) {
                setTimeout(loop, 100);
            } else {
                if (!logmode) {
                    EventHandler.detachResizeReRenderEventMap(0, this.output.id);
                    this.output.clear();
                } else {
                    Terminal.turnBackToBeginningOfLine();
                    Terminal.clearLine();
                }
            }
        }

        loop();
    }

    public stop(): void {
        this.spinning = false;
    }
}
