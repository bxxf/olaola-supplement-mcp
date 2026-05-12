export type OlaolaErrorKind = "http" | "auth" | "parse" | "tool_input" | "not_found";

export interface OlaolaErrorOptions {
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class OlaolaError extends Error {
  readonly kind: OlaolaErrorKind;
  readonly details: Record<string, unknown> | undefined;

  constructor(kind: OlaolaErrorKind, message: string, options: OlaolaErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.kind = kind;
    this.details = options.details;
  }
}

export class OlaolaHttpError extends OlaolaError {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
    options: Omit<OlaolaErrorOptions, "details"> = {},
  ) {
    super("http", message, { ...options, details: { status, url } });
  }
}

export class OlaolaAuthError extends OlaolaError {
  constructor(message: string, options: OlaolaErrorOptions = {}) {
    super("auth", message, options);
  }
}

export class OlaolaParseError extends OlaolaError {
  constructor(message: string, options: OlaolaErrorOptions = {}) {
    super("parse", message, options);
  }
}

export class OlaolaToolInputError extends OlaolaError {
  constructor(message: string, options: OlaolaErrorOptions = {}) {
    super("tool_input", message, options);
  }
}

export class OlaolaNotFoundError extends OlaolaError {
  constructor(message: string, options: OlaolaErrorOptions = {}) {
    super("not_found", message, options);
  }
}
