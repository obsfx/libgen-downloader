import type { Candidate } from "../types";
import { HeuristicRanker } from "./heuristic-ranker";
import { MD5_HREF, MIN_RESULT_COLUMNS } from "../settings";

export class ResultsTableHeuristicRanker extends HeuristicRanker {
  protected score({ element }: Candidate): number {
    const rows = [...element.querySelectorAll("tr")];
    const resultLikeRows = rows.filter(
      (row) =>
        row.children.length >= MIN_RESULT_COLUMNS &&
        [...row.querySelectorAll("a[href]")].some((anchor) =>
          MD5_HREF.test(anchor.getAttribute("href") ?? "")
        )
    );
    return resultLikeRows.length;
  }
}
