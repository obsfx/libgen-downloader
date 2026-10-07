import type { LearnedSelector, ResolutionTask } from "../types";

export abstract class SelectorStore {
  abstract get(scopeKey: string, task: ResolutionTask): Promise<LearnedSelector | undefined>;
  abstract set(scopeKey: string, task: ResolutionTask, selector: LearnedSelector): Promise<void>;
  abstract delete(scopeKey: string, task: ResolutionTask): Promise<void>;

  protected entryKey(scopeKey: string, task: ResolutionTask): string {
    return `${scopeKey}|${task}`;
  }
}
