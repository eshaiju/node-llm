import repl from "node:repl";
import { createLLM, NodeLLM, Tool, z } from "../packages/core/dist/index.js";

console.log("--- NodeLLM Console ---");
console.log("Available Globals:");
console.log("  - NodeLLM (Static API)");
console.log("  - createLLM (Factory Function)");
console.log("  - Tool (Base Tool Class)");
console.log("  - z (Zod Schema)");
console.log("");
console.log("Quick Examples:");
console.log('  const chat = NodeLLM.chat("gpt-4o-mini")');
console.log('  const res = await chat.ask("Hello!")');
console.log("  console.log(res.toString())");
console.log("");
console.log("  const models = NodeLLM.models.all()");
console.log("  console.log(models.length)");
console.log("--------------------------");

const r = repl.start("nodellm > ");

Object.assign(r.context, {
  NodeLLM,
  createLLM,
  Tool,
  z
});
