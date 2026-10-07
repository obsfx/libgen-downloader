import type { ValidationResult } from "../types";
import { CandidateValidator } from "./candidate-validator";
import { MIN_LINKED_ROW_RATIO, MIN_RESULT_COLUMNS } from "../settings";

export class ResultsTableValidator extends CandidateValidator<Element> {
  async validate(element: Element): Promise<ValidationResult<Element>> {
    if (element.tagName !== "TABLE") {
      return this.invalid(`expected a table, got ${element.tagName}`);
    }
    const bodyRows = [...element.querySelectorAll("tr")].filter(
      (row) => !row.querySelector("th") && row.parentElement?.tagName !== "THEAD"
    );
    if (bodyRows.length === 0) {
      return this.isEmptyResultsTable(element);
    }
    const wideRows = bodyRows.filter((row) => row.children.length >= MIN_RESULT_COLUMNS);
    const linkedRows = wideRows.filter((row) => row.querySelector("a[href]"));
    if (wideRows.length / bodyRows.length < MIN_LINKED_ROW_RATIO) {
      return this.invalid("rows are too narrow for a results table");
    }
    if (linkedRows.length / bodyRows.length < MIN_LINKED_ROW_RATIO) {
      return this.invalid("rows carry no links");
    }
    return { valid: true, payload: element };
  }

  private isEmptyResultsTable(element: Element): ValidationResult<Element> {
    const headerCells = element.querySelectorAll("th").length;
    if (headerCells >= MIN_RESULT_COLUMNS) {
      return { valid: true, payload: element };
    }
    return this.invalid("table has no result rows");
  }
}
