export abstract class CopyButtons {
  private static readonly resetDelayMs = 1600;
  private static stop: (() => void) | null = null;

  static start(): () => void {
    CopyButtons.stop ??= CopyButtons.listen();
    return CopyButtons.stop;
  }

  private static listen(): () => void {
    const timers = new Map<HTMLElement, number>();
    const listeners = new AbortController();
    document.addEventListener(
      "click",
      (event) => {
        if (!(event.target instanceof Element)) {
          return;
        }
        const button = event.target.closest<HTMLElement>("[data-copy]");
        if (!button?.dataset.copy) {
          return;
        }
        navigator.clipboard.writeText(button.dataset.copy).then(() => {
          window.clearTimeout(timers.get(button));
          button.dataset.copied = "";
          timers.set(
            button,
            window.setTimeout(() => {
              delete button.dataset.copied;
            }, CopyButtons.resetDelayMs),
          );
        });
      },
      { signal: listeners.signal },
    );
    return () => {
      CopyButtons.stop = null;
      listeners.abort();
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }
}
