import { expect, it } from "vitest";
import { Chat } from "../src/chat/Chat.js";
import { LLM } from "../src/llm.js";

it("retries provider failures", async () => {
  let calls = 0;

  const provider = {
    async chat() {
      calls++;
      if (calls < 3) {
        throw new Error("Temporary failure");
      }
      return { content: "ok" };
    },
  };

  LLM.configure({
    provider: provider as any,
    retry: { attempts: 3 },
  });

  const chat = LLM.chat("test");

  const result = await chat.ask("hi");

  expect(result).toBe("ok");
  expect(calls).toBe(3);
});
