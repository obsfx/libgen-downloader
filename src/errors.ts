import type { FailureKind } from "./api/availability/types";

export class OperationTimeoutError extends Error {
  constructor(message = "The operation timed out.") {
    super(message);
    this.name = "TimeoutError";
  }
}

export class HttpStatusError extends Error {
  constructor(
    readonly status: number,
    url: string
  ) {
    super(`HTTP ${status} for ${url}`);
    this.name = "HttpStatusError";
  }
}

export class TransientDownloadError extends Error {
  constructor(
    message: string,
    readonly kind: Exclude<FailureKind, "not-available"> = "server-error"
  ) {
    super(message);
    this.name = "TransientDownloadError";
  }
}

export class DownloadUnavailableError extends Error {
  readonly kind = "not-available";

  constructor(message: string) {
    super(message);
    this.name = "DownloadUnavailableError";
  }
}

export class ConfigFetchError extends Error {
  constructor() {
    super("Error occurred while fetching configuration.");
    this.name = "ConfigFetchError";
  }
}

export class DocumentFetchError extends Error {
  constructor(url: string) {
    super(`Error occurred while fetching document of ${url}`);
    this.name = "DocumentFetchError";
  }
}

export class FileDownloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileDownloadError";
  }
}

export class UnknownMirrorTypeError extends Error {
  constructor(mirrorType: string) {
    super(`Unknown mirror type: ${mirrorType}`);
    this.name = "UnknownMirrorTypeError";
  }
}

export class UnsupportedModelInputError extends Error {
  constructor(input: string) {
    super(`Unsupported model input: ${input}`);
    this.name = "UnsupportedModelInputError";
  }
}

export class MissingContextProviderError extends Error {
  constructor(hook: string, provider: string) {
    super(`${hook} must be used within a ${provider}`);
    this.name = "MissingContextProviderError";
  }
}
