export interface SearchReport {
  mirror: string;
  query: string;
  entries: number;
  entriesWithMD5: number;
  error?: string;
}

export interface DownloadReport {
  source: string;
  sourceType: string;
  md5: string;
  extension: string;
  listed: boolean;
  opened: boolean;
  signatureMatches: boolean;
  elapsedMs: number;
  error?: string;
}

export interface SampleBook {
  md5: string;
  extension: string;
  title: string;
}

export interface FileSignature {
  offset: number;
  bytes: number[];
}

export interface SearchRun {
  report: SearchReport;
  books: SampleBook[];
}

export interface WaitRecord {
  waits: number;
  waitedMs: number;
}

export interface ChainDelivery extends WaitRecord {
  delivered: boolean;
  sourceName: string;
  failure?: string;
}

export interface AppSearchRun extends SearchRun {
  waits: WaitRecord;
}
