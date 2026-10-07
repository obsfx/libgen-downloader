import type { LearnedSelector, ResolutionTask } from "../../src/api/resolution/types";
import { SelectorStore } from "../../src/api/resolution/store/selector-store";

export class MemorySelectorStore extends SelectorStore {
  private readonly entries = new Map<string, LearnedSelector>();

  async get(scopeKey: string, task: ResolutionTask): Promise<LearnedSelector | undefined> {
    return this.entries.get(this.entryKey(scopeKey, task));
  }

  async set(scopeKey: string, task: ResolutionTask, selector: LearnedSelector): Promise<void> {
    this.entries.set(this.entryKey(scopeKey, task), selector);
  }

  async delete(scopeKey: string, task: ResolutionTask): Promise<void> {
    this.entries.delete(this.entryKey(scopeKey, task));
  }
}
