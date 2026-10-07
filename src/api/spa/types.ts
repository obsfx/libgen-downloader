export interface SpaEnvelope<TResult> {
  result: TResult;
  isError: boolean;
}

export interface SpaDownloadLinks {
  list: string[];
  links: string[];
}

export interface SpaDecryptedLink {
  id: string;
  title: string;
  downloadLink: string;
}
