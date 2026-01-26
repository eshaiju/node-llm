import { test, expect, describe, afterEach, beforeEach } from "vitest";
import { mockLLM } from "../../src/Mocker.js";
import { NodeLLM, providerRegistry, Provider } from "@node-llm/core";
import { MockProvider } from "../helpers/MockProvider.js";

describe("Mocker Feature: Prompt Snapshots", () => {
  let mocker: ReturnType<typeof mockLLM>;

  beforeEach(() => {
    providerRegistry.register("mock-provider", () => new MockProvider() as unknown as Provider);
    mocker = mockLLM();
  });

  afterEach(() => {
    mocker.clear();
  });

  test("Snapshots chat messages", async () => {
    mocker.chat("Hello").respond("Hi");

    // Test basic chat snapshot
    const llm = NodeLLM.withProvider("mock-provider");
    await llm.chat().ask("Hello");

    const lastCall = mocker.getLastCall();
    expect(lastCall).toBeDefined();
    // Snapshot should contain just the user message
    expect(lastCall!.prompt).toMatchSnapshot();
  });

  test("Snapshots embedding input", async () => {
    mocker.embed("text").respond({ vectors: [[0.1]] });

    const llm = NodeLLM.withProvider("mock-provider");
    await llm.embed("text");

    expect(mocker.getLastCall()?.prompt).toMatchSnapshot();
  });

  test("Snapshots paint prompt", async () => {
    mocker.paint("A sunset").respond({ url: "img.png" });

    const llm = NodeLLM.withProvider("mock-provider");
    await llm.paint("A sunset");

    expect(mocker.getLastCall()?.prompt).toBe("A sunset");
  });
});
