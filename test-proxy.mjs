import { NodeLLM } from "./packages/core/dist/index.js";

async function test() {
  console.log("Testing NodeLLM.models.find...");
  try {
    const model = NodeLLM.models.find("gpt-4o");
    console.log("Found model:", model?.id);
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}

test();
