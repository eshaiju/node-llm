export const DEFAULT_SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g, // OpenAI/Anthropic likely patterns
  /x-[a-zA-Z0-9]{20,}/g, // Generic API keys
  /[a-zA-Z0-9]{32,}/g // Long hashes/keys
];

export interface ScrubberOptions {
  customScrubber?: (data: unknown) => unknown;
}

export class Scrubber {
  private customScrubber?: (data: unknown) => unknown;

  constructor(options: ScrubberOptions = {}) {
    this.customScrubber = options.customScrubber;
  }

  /**
   * Applies scrubbing to the data using default patterns and custom logic.
   */
  public scrub(data: unknown): unknown {
    // 1. Perform deep regex scrubbing and key-based scrubbing
    let result = this.deepScrub(data);

    // 2. Run custom hook on the scrubbed data if provided
    if (this.customScrubber) {
      result = this.customScrubber(result);
    }

    return result;
  }

  private deepScrub(val: unknown): unknown {
    if (typeof val === "string") {
      let scrubbed = val;
      for (const pattern of DEFAULT_SECRET_PATTERNS) {
        scrubbed = scrubbed.replace(pattern, "[REDACTED]");
      }
      return scrubbed;
    }

    if (Array.isArray(val)) {
      return val.map((v) => this.deepScrub(v));
    }

    if (val !== null && typeof val === "object") {
      const obj = val as Record<string, unknown>;
      const newObj: Record<string, unknown> = {};

      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const lowerKey = key.toLowerCase();
        const value = obj[key];

        // SENSITIVE KEY LOGIC:
        // Only redact if the key looks like a credential AND the value is a string.
        // We don't want to redact 'total_tokens' or 'input_tokens' which are numbers.
        const isCredentialKey =
          lowerKey === "key" ||
          lowerKey === "api_key" ||
          lowerKey === "token" ||
          lowerKey === "auth" ||
          lowerKey === "authorization";

        if (isCredentialKey && typeof value === "string") {
          newObj[key] = "[REDACTED]";
        } else {
          newObj[key] = this.deepScrub(value);
        }
      }
      return newObj;
    }

    return val;
  }
}
