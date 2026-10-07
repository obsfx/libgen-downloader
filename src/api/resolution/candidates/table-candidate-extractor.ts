import { CandidateExtractor } from "./candidate-extractor";
import { HEADER_CELL_LENGTH, TABLE_SAMPLE_LENGTH } from "../settings";

export class TableCandidateExtractor extends CandidateExtractor {
  protected readonly selector = "table";

  protected describe(table: Element): string {
    const rows = [...table.querySelectorAll("tr")];
    const [headerRow, firstDataRow] = rows;
    const header = [...(headerRow?.children ?? [])]
      .map((cell) => {
        return this.normalizedText(cell, HEADER_CELL_LENGTH);
      })
      .join(" | ");
    let sample = "";
    if (firstDataRow) {
      sample = this.normalizedText(firstDataRow, TABLE_SAMPLE_LENGTH);
    }
    const columnCount = headerRow?.children.length ?? 0;
    return `<table> rows=${rows.length} cols=${columnCount} header="${header}" sample="${sample}"`;
  }
}
