import { describe, it, expect, afterEach } from "vitest";
import { LLM } from "../../../../src/index.js";
import { setupVCR } from "../../../helpers/vcr.js";
import "dotenv/config";

describe("DeepSeek Reasoning Integration (VCR)", { timeout: 30000 }, () => {
  let polly: any;

  afterEach(async () => {
    if (polly) {
      await polly.stop();
    }
  });

  it("should capture reasoning content for deepseek-reasoner", async ({ task }) => {
    polly = setupVCR(task.name, "deepseek");
    LLM.configure({ provider: "deepseek" });
    const chat = LLM.chat("deepseek-reasoner");
    
    const response = await chat.ask("Calculate 123 * 456 and explain the steps.");
    
    expect(response.reasoning).to.be.a("string");
    expect(response.reasoning!.length).to.be.greaterThan(0);
    expect(response.content).to.be.a("string");
  });

  it("should stream reasoning content for deepseek-reasoner", async ({ task }) => {
    polly = setupVCR(task.name, "deepseek");
    LLM.configure({ provider: "deepseek" });
    const chat = LLM.chat("deepseek-reasoner");
    
    let hasReasoning = false;
    let hasContent = false;

    for await (const chunk of chat.stream("What is the capital of France?")) {
      if (chunk.reasoning) hasReasoning = true;
      if (chunk.content) hasContent = true;
    }

    expect(hasReasoning).to.be.true;
    expect(hasContent).to.be.true;
  });
});
