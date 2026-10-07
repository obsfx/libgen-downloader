export interface PinnedFile {
  source: string;
  target: string;
  sha256: string;
}

export interface PinnedModel {
  repository: string;
  revision: string;
  directory: string;
  files: PinnedFile[];
}

export interface FetchedFile {
  target: string;
  status: "cached" | "downloaded";
}
