import { test, expect, describe, beforeEach, afterEach } from "vitest";
import { setupVCR } from "../../src/vcr.js";
import { NodeLLM, providerRegistry } from "@node-llm/core";
import fs from "node:fs";
import path from "node:path";
import { MockProvider } from "../helpers/MockProvider.js";

describe("VCR: Streaming Interactions", () => {
  const CASSETTE_DIR = path.join(__dirname, "../cassettes");
  const CASSETTE_NAME = "vcr-streaming";
  const CASSETTE_PATH = path.join(CASSETTE_DIR, `${CASSETTE_NAME}.json`);

  beforeEach(() => {
    providerRegistry.register("mock-provider", () => new MockProvider());
  });

  afterEach(() => {
    providerRegistry.setInterceptor(undefined);
  });

  test("Replays from cassette", async () => {
    const vcr = setupVCR(CASSETTE_NAME, { mode: "auto", cassettesDir: CASSETTE_DIR });
    const llm = NodeLLM.withProvider("mock-provider");

    const res = await llm.chat().ask("Tell me a short story");
    await vcr.stop();

    expect(res.content).toBeDefined();
  });

  test("Replays chunk cassette", async () => {
    const vcr = setupVCR("streaming-chunks", { mode: "auto", cassettesDir: CASSETTE_DIR });
    const llm = NodeLLM.withProvider("mock-provider");

    const res = await llm.chat().ask("Test");
    await vcr.stop();

    expect(res.content).toBeDefined();
  });

  test("Throws error if no streaming chunks in cassette during replay", async () => {
    // Use a separate temp cassette to avoid overwriting the main one
    const TEMP_CASSETTE_NAME = "vcr-streaming-error-test";
    const TEMP_CASSETTE_PATH = path.join(CASSETTE_DIR, `${TEMP_CASSETTE_NAME}.json`);

    // Create a minimal cassette without chunks
    const dir = path.dirname(TEMP_CASSETTE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
      TEMP_CASSETTE_PATH,
      JSON.stringify({
        name: TEMP_CASSETTE_NAME,
        interactions: [
          {
            method: "stream",
            request: { messages: [{ role: "user", content: "Test" }] },
            response: null
            // Missing chunks!
          }
        ]
      })
    );

    const vcrReplay = setupVCR(TEMP_CASSETTE_NAME, { mode: "replay", cassettesDir: CASSETTE_DIR });
    const llmReplay = NodeLLM.withProvider("mock-provider");

    const stream = llmReplay.chat().stream("Test");

    let threwError = false;
    try {
      for await (const chunk of stream) {
        // consume
      }
    } catch (e) {
      threwError = true;
      expect(String(e)).toMatch(/streaming|chunks/i);
    }

    expect(threwError).toBe(true);
    await vcrReplay.stop();

    // Clean up temp cassette
    if (fs.existsSync(TEMP_CASSETTE_PATH)) fs.unlinkSync(TEMP_CASSETTE_PATH);
  });
});
