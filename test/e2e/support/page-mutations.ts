let tokenCounter = 0;

function nextToken(prefix: string): string {
  tokenCounter += 1;
  return `${prefix}${tokenCounter.toString(36)}x${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function renameIdsAndClasses(document: Document): void {
  const renamed = new Map<string, string>();
  const rename = (value: string, prefix: string) => {
    if (!renamed.has(value)) {
      renamed.set(value, nextToken(prefix));
    }
    return renamed.get(value) ?? value;
  };
  for (const element of document.querySelectorAll("[id], [class]")) {
    const id = element.getAttribute("id");
    if (id) {
      element.setAttribute("id", rename(id, "i"));
    }
    const classNames = element.getAttribute("class");
    if (classNames) {
      const renamedClasses = classNames
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => rename(name, "c"));
      element.setAttribute("class", renamedClasses.join(" "));
    }
  }
}

function wrapTables(document: Document): void {
  for (const table of document.querySelectorAll("table")) {
    const wrapper = document.createElement("div");
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.append(table);
  }
}

export function moveLastColumnFirst(table: Element): void {
  for (const row of table.querySelectorAll("tr")) {
    const cells = [...row.children];
    const lastCell = cells.at(-1);
    if (cells.length > 2 && lastCell) {
      row.prepend(lastCell);
    }
  }
}

function relabelDownloadButtons(document: Document): void {
  for (const anchor of document.querySelectorAll("a")) {
    if (anchor.textContent?.trim() !== "GET") {
      continue;
    }
    const leaf = [anchor, ...anchor.querySelectorAll("*")].find(
      (element) => element.children.length === 0 && element.textContent?.trim() === "GET"
    );
    if (leaf) {
      leaf.textContent = "Download";
    }
  }
}

function injectAdvertisementLinks(document: Document): void {
  const banner = document.createElement("div");
  banner.innerHTML = [
    '<a href="https://fastdl.example/click?id=8812">Download now</a>',
    '<a href="https://promo.example/offer">Fast download (premium)</a>',
  ].join(" | ");
  document.body.prepend(banner);
}

export function applyMarkupDrift(document: Document): void {
  renameIdsAndClasses(document);
  wrapTables(document);
  relabelDownloadButtons(document);
  injectAdvertisementLinks(document);
}
