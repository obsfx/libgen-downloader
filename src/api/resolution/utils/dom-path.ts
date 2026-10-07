import type { PathStep } from "../types";

export function pathFrom(root: Element, element: Element): PathStep[] {
  const steps: PathStep[] = [];
  let current: Element | undefined = element;
  while (current && current !== root) {
    const parent: Element | undefined = current.parentElement ?? undefined;
    if (!parent) {
      break;
    }
    const tag = current.tagName;
    const sameTagSiblings = [...parent.children].filter((child) => child.tagName === tag);
    steps.unshift({ tag, nth: sameTagSiblings.indexOf(current) });
    current = parent;
  }
  return steps;
}

export function resolvePath(root: Element, steps: PathStep[]): Element | undefined {
  let current: Element | undefined = root;
  for (const step of steps) {
    const sameTagChildren: Element[] = [...(current?.children ?? [])].filter(
      (child) => child.tagName === step.tag
    );
    current = sameTagChildren[step.nth];
    if (!current) {
      return undefined;
    }
  }
  return current;
}
