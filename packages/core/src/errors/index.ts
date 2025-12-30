/**
 * Base class for all node-llm errors
 */
export class LLMError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errors occurring during API calls to providers
 */
export class APIError extends LLMError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: any,
    public readonly provider?: string,
    public readonly model?: string
  ) {
    super(message, "API_ERROR");
  }
}

/**
 * 400 - Invalid request parameters
 */
export class BadRequestError extends APIError {
  constructor(message: string, body: any, provider?: string, model?: string) {
    super(message, 400, body, provider, model);
    this.name = "BadRequestError";
  }
}

/**
 * 401/403 - API key or permission issues
 */
export class AuthenticationError extends APIError {
  constructor(message: string, status: number, body: any, provider?: string) {
    super(message, status, body, provider);
    this.name = "AuthenticationError";
  }
}

/**
 * 429 - Rate limit exceeded
 */
export class RateLimitError extends APIError {
  constructor(message: string, body: any, provider?: string, model?: string) {
    super(message, 429, body, provider, model);
    this.name = "RateLimitError";
  }
}

/**
 * 500+ - Provider server error
 */
export class ServerError extends APIError {
  constructor(message: string, status: number, body: any, provider?: string, model?: string) {
    super(message, status, body, provider, model);
    this.name = "ServerError";
  }
}

/**
 * 502/503/529 - Service overloaded/unavailable
 */
export class ServiceUnavailableError extends ServerError {
  constructor(message: string, status: number, body: any, provider?: string, model?: string) {
    super(message, status, body, provider, model);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Misconfiguration (e.g. missing API key)
 */
export class ConfigurationError extends LLMError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR");
  }
}

/**
 * Requested model or provider not found
 */
export class NotFoundError extends LLMError {
  constructor(message: string) {
    super(message, "NOT_FOUND_ERROR");
  }
}

/**
 * Model does not support requested capability
 */
export class CapabilityError extends LLMError {
  constructor(message: string) {
    super(message, "CAPABILITY_ERROR");
  }
}
