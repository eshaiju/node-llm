import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  LLM.configure({ 
    provider: "gemini",
    defaultTranscriptionModel: "gemini-2.0-flash"
  });

  // Use the sample audio file
  const audioFile = path.resolve(__dirname, "../audio/sample-0.mp3");

  try {
    console.log(`Transcribing ${audioFile} with Gemini...`);
    const transcription = await LLM.transcribe(audioFile);
    
    console.log(`\nModel used: ${transcription.model}`);
    console.log("--- Transcription Content ---");
    console.log(transcription.text);
    console.log("----------------------------");
    
    // Test with language specification
    console.log("\nTranscribing again with language hint (English)...");
    const result = await LLM.transcribe(audioFile, { language: "English" });
    console.log("Result text length:", result.text.length);

  } catch (e) {
    console.error("Transcription failed:", e.message);
  }
}

main().catch(console.error);
