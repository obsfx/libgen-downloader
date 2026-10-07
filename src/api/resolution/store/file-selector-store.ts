import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LearnedSelector, ResolutionTask, SelectorRecords } from "../types";
import { SelectorStore } from "./selector-store";

export class FileSelectorStore extends SelectorStore {
  private records: SelectorRecords | undefined;

  constructor(private readonly filePath: string) {
    super();
  }

  async get(scopeKey: string, task: ResolutionTask): Promise<LearnedSelector | undefined> {
    const records = await this.load();
    return records[this.entryKey(scopeKey, task)];
  }

  async set(scopeKey: string, task: ResolutionTask, selector: LearnedSelector): Promise<void> {
    const records = await this.load();
    records[this.entryKey(scopeKey, task)] = selector;
    await this.persist(records);
  }

  async delete(scopeKey: string, task: ResolutionTask): Promise<void> {
    const records = await this.load();
    delete records[this.entryKey(scopeKey, task)];
    await this.persist(records);
  }

  private async load(): Promise<SelectorRecords> {
    if (this.records) {
      return this.records;
    }
    try {
      const contents = await readFile(this.filePath, "utf8");
      this.records = JSON.parse(contents) as SelectorRecords;
    } catch {
      this.records = {};
    }
    return this.records;
  }

  private async persist(records: SelectorRecords): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(records, undefined, 2));
    await rename(temporaryPath, this.filePath);
  }
}
