export interface HttpRequestOptions {
  signal: AbortSignal;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
}

export interface FetchedDocument {
  document: Document;
  ok: boolean;
  status: number;
}
