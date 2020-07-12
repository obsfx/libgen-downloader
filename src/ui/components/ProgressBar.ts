import { 
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

    constructor(title: string) {
        this.x = 0;
        this.y = 0;

        this.title = title;

        this.width = 25;
        this.progress = 0;
        this.total = null;

        this.completeChar = '█';
        this.incompleteChar = ' ';

        this.output = new Text('', 'none');

        EventHandler.attachResizeReRenderEvent(0, this.output.id, this.output.onResize.bind(this.output));
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
                    .replace('{percent}', `${percentage}%`);

            this.output.clear();
            this.output.setXY(this.x, this.y);
            this.output.setText(output);
            this.output.onResize();
        }
    }

    public hide(): void {
        EventHandler.detachResizeReRenderEventMap(0, this.output.id);
        this.output.clear();
    }
}
