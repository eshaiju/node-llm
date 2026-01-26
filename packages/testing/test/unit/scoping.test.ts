import { test, expect, describe, beforeEach, afterEach } from "vitest";
import { withVCR, describeVCR } from "../../src/vcr.js";
import { NodeLLM, providerRegistry } from "@node-llm/core";
import fs from "node:fs";
import path from "node:path";
import { MockProvider } from "../helpers/MockProvider.js";

describe("VCR Feature 7: Grouped Scoping", () => {
  let mock: MockProvider;

  beforeEach(() => {
    mock = new MockProvider();
    providerRegistry.register("mock-provider", () => mock);
  });

  afterEach(() => {
    providerRegistry.setInterceptor(undefined);
  });

  describeVCR("Audit Scope", () => {
    test(
      "Saves cassette in scoped directory",
      withVCR(async () => {
        const llm = NodeLLM.withProvider("mock-provider");
        await llm.chat().ask("Scope test");
      })
    );
  });

  test("Verifies file location in subfolder", async () => {
    const scopeDir = path.join(process.cwd(), ".llm-cassettes", "audit-scope");
    expect(fs.existsSync(scopeDir)).toBe(true);

    const files = fs.readdirSync(scopeDir);
    expect(files.some((f) => f.includes("saves-cassette-in-scoped-directory"))).toBe(true);
  });
});
