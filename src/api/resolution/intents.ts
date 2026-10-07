import type { ResolutionTask } from "./types";

export const RESOLUTION_INTENTS = {
  "download-link":
    "The link that downloads the book file itself: the main download (GET) button on the book's download page.",
  "results-table":
    "The table listing the book search results, one row per book with title, author, publisher, year, language, pages, size, extension and mirror links.",
} satisfies Record<ResolutionTask, string>;
