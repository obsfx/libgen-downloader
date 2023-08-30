export interface Entry {
  id: string;
  authors: string;
  title: string;
  publisher: string;
  year: string;
  pages: string;
  language: string;
  size: string;
  extension: string;
  mirror: string;
  downloadUrls: string[];
  alternativeDirectDownloadUrl?: string;
}
