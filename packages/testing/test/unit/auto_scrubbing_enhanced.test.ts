import { describe, it, expect } from "vitest";
import { Scrubber } from "../../src/Scrubber.js";

describe("Enhanced Auto-Scrubbing", () => {
  const scrubber = new Scrubber();

  it("should scrub email addresses from strings", () => {
    const input = "Contact me at user@example.com or support@company.co.uk";
    const result = scrubber.scrub(input);
    expect(result).toBe("Contact me at [REDACTED] or [REDACTED]");
  });

  it("should scrub JWT tokens", () => {
    const jwt =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const result = scrubber.scrub(jwt);
    expect(result).toBe("Bearer [REDACTED]");
  });

  it("should scrub IPv4 addresses", () => {
    const input = "Server IP is 192.168.1.1 and gateway is 10.0.0.1";
    const result = scrubber.scrub(input);
    expect(result).toBe("Server IP is [REDACTED] and gateway is [REDACTED]");
  });

  it("should scrub Google API keys", () => {
    const input = "key=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q";
    const result = scrubber.scrub(input);
    expect(result).toBe("key=[REDACTED]");
  });

  it("should scrub sensitive keys in nested objects", () => {
    const input = {
      user: {
        email: "test@example.com",
        password: "secretpassword123",
        settings: {
          apiKey: "sk-1234567890abcdef1234567890"
        }
      },
      status: "ok"
    };
    const result = scrubber.scrub(input) as any;

    expect(result.user.email).toBe("[REDACTED]");
    expect(result.user.password).toBe("[REDACTED]");
    expect(result.user.settings.apiKey).toBe("[REDACTED]");
    expect(result.status).toBe("ok");
  });

  it("should scrub custom sensitive keys like 'cookie'", () => {
    const input = {
      headers: {
        Cookie: "sessionid=12345; user=abc",
        "Content-Type": "application/json"
      }
    };
    const result = scrubber.scrub(input) as any;
    expect(result.headers.Cookie).toBe("[REDACTED]");
    expect(result.headers["Content-Type"]).toBe("application/json");
  });

  it("should scrub AWS-like credential pairs in strings", () => {
    const input =
      "Using access_key: AKIA1234567890EXAMPLE and secret_key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
    const result = scrubber.scrub(input);
    expect(result).toBe("Using [REDACTED] and [REDACTED]");
  });
});
