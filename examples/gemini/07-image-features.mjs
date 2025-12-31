import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";
import fs from "fs/promises";

LLM.configure({ 
  provider: "gemini",
});

async function main() {
  console.log("🎨 Generating image with Gemini Imagen...");
  try {
    const image = await LLM.paint("a cute robot holding a sign that says NODE-LLM", {
      model: "imagen-4.0-generate-001",
    });
    
    console.log("✅ Image generated!");
    console.log("Mime Type:", image.mimeType);
    console.log("Data length:", image.data?.length);

    // Test saving to disk
    const filename = "robot.png";
    console.log(`💾 Saving image to ${filename}...`);
    await image.save(filename);
    console.log("✅ Saved!");

    // Test Buffer conversion
    const buffer = await image.toBuffer();
    console.log(`📊 Buffer size: ${buffer.length} bytes`);

    // Cleanup
    await fs.unlink(filename);
    console.log("扫 Cleanup done.");

  } catch (error) {
    console.error("❌ Example failed:", error.message);
  }
}

main();
