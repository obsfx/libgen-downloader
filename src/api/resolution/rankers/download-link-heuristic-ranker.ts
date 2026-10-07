import type { Candidate } from "../types";
import { HeuristicRanker } from "./heuristic-ranker";
import { DOWNLOAD_TEXT, FILE_ENDPOINT_HREF, KEY_PARAMETER, MD5_HREF } from "../settings";

export class DownloadLinkHeuristicRanker extends HeuristicRanker {
  protected score({ element }: Candidate): number {
    const href = element.getAttribute("href") ?? "";
    const text = (element.textContent ?? "").trim();
    let score = 0;
    if (FILE_ENDPOINT_HREF.test(href)) {
      score += 3;
    }
    if (MD5_HREF.test(href)) {
      score += 1;
    }
    if (KEY_PARAMETER.test(href)) {
      score += 1;
    }
    if (DOWNLOAD_TEXT.test(text)) {
      score += 2;
    }
    return score;
  }
}
