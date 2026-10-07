import type { FailureKind } from "../../availability/types";
import type { ResolutionRequest, ValidationResult } from "../types";

export abstract class CandidateValidator<TPayload> {
  abstract validate(
    element: Element,
    request: ResolutionRequest
  ): Promise<ValidationResult<TPayload>>;

  protected invalid(
    reason: string,
    kind: FailureKind = "not-available"
  ): ValidationResult<TPayload> {
    return { valid: false, reason, kind };
  }
}
