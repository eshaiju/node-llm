import { test, expect, describe, beforeEach, afterEach } from "vitest";
import { setupVCR } from "../../src/vcr.js";
import { NodeLLM, providerRegistry } from "@node-llm/core";
import fs from "node:fs";
import path from "node:path";
import { MockProvider } from "../helpers/MockProvider.js";

describe("VCR Feature 1: Native Record & Replay", () => {
  const CASSETTE_NAME = "feature-1-vcr";
  const CASSETTE_DIR = path.join(__dirname, "../cassettes");
  const CASSETTE_PATH = path.join(CASSETTE_DIR, `${CASSETTE_NAME}.json`);
  let mock: MockProvider;

  beforeEach(() => {
    mock = new MockProvider();
    providerRegistry.register("mock-provider", () => mock);
  });

  afterEach(() => {
    providerRegistry.setInterceptor(undefined);
  });

  test("Replays interactions from cassette", async () => {
    const vcr = setupVCR(CASSETTE_NAME, { mode: "auto", cassettesDir: CASSETTE_DIR });

    const llm = NodeLLM.withProvider("mock-provider");
    const res = await llm.chat().ask("Record me");

    expect(res.content).toBe("Response to Record me");
    expect(mock.chat).toHaveBeenCalledTimes(0); // Replayed from cassette, not called

    await vcr.stop();
  });
});
