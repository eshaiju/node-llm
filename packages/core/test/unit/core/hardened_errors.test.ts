import { describe, it, expect } from "vitest";
import {
  BadRequestError,
  ContextWindowExceededError,
  RateLimitError,
  InsufficientQuotaError,
  InvalidModelError,
  NotFoundError
} from "../../../src/errors/index.js";
import { handleOpenAIError } from "../../../src/providers/openai/Errors.js";
import { handleAnthropicError } from "../../../src/providers/anthropic/Errors.js";

describe("Hardened Error Classification", () => {
  describe("OpenAI", () => {
    it("should classify context_length_exceeded as ContextWindowExceededError", async () => {
      const response = new Response(
        JSON.stringify({
          error: { code: "context_length_exceeded", message: "Too many tokens" }
        }),
        { status: 400 }
      );

      try {
        await handleOpenAIError(response, "gpt-4o");
      } catch (e: any) {
        expect(e).toBeInstanceOf(ContextWindowExceededError);
        expect(e).toBeInstanceOf(BadRequestError); // Compatibility check
        expect(e.model).toBe("gpt-4o");
      }
    });

    it("should classify insufficient_quota as InsufficientQuotaError", async () => {
      const response = new Response(
        JSON.stringify({
          error: { code: "insufficient_quota", message: "Out of money" }
        }),
        { status: 429 }
      );

      try {
        await handleOpenAIError(response);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InsufficientQuotaError);
        expect(e).toBeInstanceOf(RateLimitError); // Compatibility check
      }
    });

    it("should classify model_not_found as InvalidModelError", async () => {
      const response = new Response(
        JSON.stringify({
          error: { code: "model_not_found", message: "No such model" }
        }),
        { status: 404 }
      );

      try {
        await handleOpenAIError(response, "fake-model");
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidModelError);
        expect(e).toBeInstanceOf(NotFoundError); // Compatibility check
        expect(e.model).toBe("fake-model");
      }
    });
  });

  describe("Anthropic", () => {
    it("should detect context errors from message text", async () => {
      const response = new Response(
        JSON.stringify({
          error: { type: "invalid_request_error", message: "prompt is too long for this model" }
        }),
        { status: 400 }
      );

      try {
        await handleAnthropicError(response, "claude-3-sonnet");
      } catch (e: any) {
        expect(e).toBeInstanceOf(ContextWindowExceededError);
      }
    });

    it("should identify invalid model from message", async () => {
      const response = new Response(
        JSON.stringify({
          error: { type: "not_found_error", message: "Could not find model: nonexistent" }
        }),
        { status: 404 }
      );

      try {
        await handleAnthropicError(response, "nonexistent");
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidModelError);
      }
    });
  });
});
