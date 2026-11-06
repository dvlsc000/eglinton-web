/**
 * A single error type for anything that goes wrong below the presentation
 * layer. Pages catch DataError and render an error state; anything else is a
 * genuine bug and bubbles to the route's error boundary.
 */
export type DataErrorCode =
  | "NETWORK" // request failed or timed out
  | "HTTP" // non-2xx response
  | "VALIDATION" // response did not match the domain schema
  | "NOT_CONFIGURED" // e.g. API mode selected without an API URL
  | "UNKNOWN";

export class DataError extends Error {
  readonly code: DataErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(code: DataErrorCode, message: string, options?: { status?: number; details?: unknown; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "DataError";
    this.code = code;
    this.status = options?.status;
    this.details = options?.details;
  }
}

export function isDataError(e: unknown): e is DataError {
  return e instanceof DataError;
}
