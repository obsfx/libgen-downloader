import { 
    Terminal,
    Colors,
    EventHandler,
    Text
} from '../../ui'

export default class ProgressBar {
    private x: number;
    private y: number;

    private title: string;

    private width: number;
    private progress: number;
    public total: number | null;

    private completeChar: string;
    private incompleteChar: string;

    private output: Text;

    private logmode: boolean;

    constructor(title: string, logmode: boolean = false) {
        this.x = 0;
        this.y = 0;

        this.title = title;

        this.width = 18;
        this.progress = 0;
        this.total = null;

        this.completeChar = '█';
        this.incompleteChar = ' ';

        this.output = new Text('', 'none');

        this.logmode = logmode;

        if (!this.logmode) {
            EventHandler.attachResizeReRenderEvent(0, this.output.id, this.output.onResize.bind(this.output));
        }
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public tick(length: number): void {
        if (this.total != null) {
            this.progress += length;

            let barCount: number = Math.floor((this.width / this.total) * this.progress);
            let bar: string = `${this.completeChar.repeat(barCount)} ${this.incompleteChar.repeat(this.width - barCount)}`;

            let percentage: number = Math.floor((100 / this.total) * this.progress);

            let output: string = this.title
                    .replace('{bar}', `${bar}`)
                    .replace('{percent}', `${percentage}%`)
                    .replace('{completed}', this.progress.toString());

            if (!this.logmode) {
                this.output.clear();
                this.output.setXY(this.x, this.y);
                this.output.setText(output);
                this.output.onResize();
            } else {
                Terminal.turnBackToBeginningOfLine();
                Terminal.clearLine();

                let purifiedOutput: string = Colors.purify(output);

                if (purifiedOutput.length > process.stdout.columns) {
                    let explodedOutput: string[] = Colors.explode(output);
                    output = Colors.reCreateColoredText(explodedOutput, process.stdout.columns);
                }

                process.stdout.write(output);
            }
        }
    }

    public hide(): void {
        if (!this.logmode) {
            EventHandler.detachResizeReRenderEventMap(0, this.output.id);
            this.output.clear();
        } else {
            Terminal.turnBackToBeginningOfLine();
            process.stdout.write('\n');
        }
    }
}
