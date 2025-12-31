import { describe, it, expect, afterEach } from "vitest";
import path from "path";
import { LLM } from "../../src/index.js";
import { setupVCR } from "../helpers/vcr.js";
import "dotenv/config";

describe("Gemini Integration (VCR)", { timeout: 30000 }, () => {
  let polly: any;

  afterEach(async () => {
    if (polly) {
      await polly.stop();
    }
  });

  it("should perform a basic chat completion", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const chat = LLM.chat("gemini-2.0-flash");

    const response = await chat.ask("What is the capital of Japan?");

    expect(String(response)).toContain("Tokyo");
    expect(response.usage.input_tokens).toBeGreaterThan(0);
  });

  it("should handle tool calling", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });

    const weatherTool = {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get weather',
        parameters: { type: 'object', properties: { location: { type: 'string' } } }
      },
      handler: async ({ location }: { location: string }) => {
        return JSON.stringify({ location, temperature: 18, condition: "Cloudy" });
      }
    };

    const chat = LLM.chat("gemini-2.0-flash").withTool(weatherTool);
    const response = await chat.ask("What is the weather in Berlin?");

    expect(String(response)).toContain("18");
    expect(String(response)).toContain("Berlin");
    expect(response.usage.input_tokens).toBeGreaterThan(0);
  });

  it("should support streaming", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const chat = LLM.chat("gemini-2.0-flash");

    let fullText = "";
    for await (const chunk of chat.stream("Say 'Stream Test'")) {
      fullText += chunk.content;
    }

    expect(fullText).toContain("Stream Test");
  });

  it("should list available models", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const models = await LLM.listModels();

    expect(models.length).toBeGreaterThan(0);
    const flash = models.find(m => m.id.includes("flash"));
    expect(flash).toBeDefined();
    expect(flash?.provider).toBe("gemini");
    expect(flash?.capabilities).toContain("streaming");
  });

  it("should analyze images (Vision)", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const chat = LLM.chat("gemini-2.0-flash");

    // A small 1x1 red PNG dot
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    const response = await chat.ask("What color is this image?", {
      images: [base64Image]
    });

    expect(String(response).toLowerCase()).toContain("red");
    expect(response.usage.input_tokens).toBeGreaterThan(0);
  });

  it("should generate an image and support image features (Paint)", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const image = await LLM.paint("A sunset over the mountains", { 
      model: "imagen-4.0-generate-001" 
    });

    expect(image.data).toBeDefined();
    expect(image.mimeType).toBe("image/png");
    expect(image.isBase64).toBe(true);

    const buffer = await image.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should track total token usage", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const chat = LLM.chat("gemini-2.0-flash");

    await chat.ask("Hello");
    await chat.ask("How are you?");

    const total = chat.totalUsage;
    expect(total.input_tokens).toBeGreaterThan(0);
    expect(total.output_tokens).toBeGreaterThan(0);
    expect(total.total_tokens).toBe(total.input_tokens + total.output_tokens);
  });

  it("should generate embeddings", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const response = await LLM.embed("Hello world", { model: "text-embedding-004" });

    expect(response.vectors.length).toBe(1);
    expect(response.vector.length).toBeGreaterThan(0);
    expect(response.model).toBe("text-embedding-004");
  });

  it("should generate batch embeddings", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    const response = await LLM.embed(["Hello", "World"], { model: "text-embedding-004" });

    expect(response.vectors.length).toBe(2);
    expect(response.vectors[0].length).toBeGreaterThan(0);
    expect(response.vectors[1].length).toBeGreaterThan(0);
  });

  it("should transcribe audio", async ({ task }) => {
    polly = setupVCR(task.name, "gemini");

    LLM.configure({ provider: "gemini" });
    
    const audioPath = path.resolve(__dirname, "../../../../examples/audio/sample-0.mp3");
    const response = await LLM.transcribe(audioPath, { model: "gemini-2.0-flash" });

    expect(response.text).toBeDefined();
    expect(response.text.length).toBeGreaterThan(0);
    expect(response.model).toBe("gemini-2.0-flash");
  });
});
