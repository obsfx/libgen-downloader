export abstract class DemoTabs {
  private static readonly keySteps: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

  static start(): () => void {
    const listeners = new AbortController();
    document.querySelectorAll<HTMLElement>("[data-demo-tabs]").forEach((root) => {
      const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>("[role=tab]"));
      tabs.forEach((tab, index) => {
        tab.addEventListener(
          "click",
          () => {
            DemoTabs.select(root, tabs, index);
          },
          { signal: listeners.signal },
        );
        tab.addEventListener(
          "keydown",
          (event) => {
            const step = DemoTabs.keySteps[event.key];
            if (step === undefined) {
              return;
            }
            event.preventDefault();
            const next = (index + step + tabs.length) % tabs.length;
            DemoTabs.select(root, tabs, next);
            tabs[next].focus();
          },
          { signal: listeners.signal },
        );
      });
    });
    return () => {
      listeners.abort();
    };
  }

  private static select(root: HTMLElement, tabs: HTMLButtonElement[], selected: number): void {
    tabs.forEach((tab, index) => {
      const isSelected = index === selected;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      root.querySelector<HTMLElement>(`#${tab.getAttribute("aria-controls")}`)?.toggleAttribute("hidden", !isSelected);
    });
  }
}
