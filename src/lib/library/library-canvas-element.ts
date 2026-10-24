export class LibraryCanvasElement extends HTMLElement {
  private static readonly elementName = "library-canvas";

  private stop: (() => void) | null = null;
  private readonly sizeObserver = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (width > 0 && height > 0 && !this.stop) {
      this.mount();
    }
  });

  static register(): void {
    if (!customElements.get(LibraryCanvasElement.elementName)) {
      customElements.define(LibraryCanvasElement.elementName, LibraryCanvasElement);
    }
  }

  connectedCallback(): void {
    this.sizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    this.sizeObserver.disconnect();
    this.stop?.();
    this.stop = null;
  }

  private mount(): void {
    let isStopped = false;
    let stopRuntime: (() => void) | null = null;
    this.stop = () => {
      isStopped = true;
      stopRuntime?.();
    };
    import("@/src/lib/library/library-runtime").then(({ LibraryRuntime }) => {
      if (isStopped) {
        return;
      }
      stopRuntime = LibraryRuntime.create(this)?.start() ?? null;
    });
  }
}
