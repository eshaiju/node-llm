import { ChatRequest, ChatChunk } from "../Provider.js";
import { Capabilities } from "./Capabilities.js";

export class OpenAIStreaming {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async *execute(request: ChatRequest): AsyncGenerator<ChatChunk> {
    const temperature = Capabilities.normalizeTemperature(request.temperature, request.model);
    const body: any = {
      model: request.model,
      messages: request.messages,
      stream: true,
    };

    if (temperature !== undefined && temperature !== null) {
      body.temperature = temperature;
    }

    if (request.max_tokens) {
      body.max_tokens = request.max_tokens;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.replace("data: ", "").trim();
        if (data === "[DONE]") return;

        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;

        if (delta) {
          yield { content: delta };
        }
      }
    }
  }
}
