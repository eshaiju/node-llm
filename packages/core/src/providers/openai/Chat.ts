import { ChatRequest, ChatResponse } from "../Provider.js";
import { OpenAIChatResponse } from "./types.js";
import { Capabilities } from "./Capabilities.js";

export class OpenAIChat {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async execute(request: ChatRequest): Promise<ChatResponse> {
    const temperature = Capabilities.normalizeTemperature(request.temperature, request.model);
    
    const body: any = {
      model: request.model,
      messages: request.messages,
    };

    if (temperature !== undefined) {
      if (temperature !== null) {
        body.temperature = temperature;
      }
    }

    if (request.max_tokens) {
      body.max_tokens = request.max_tokens;
    }

    if (request.tools) {
      body.tools = request.tools;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI error (${response.status}): ${errorText}`);
    }

    const json = (await response.json()) as OpenAIChatResponse;
    const message = json.choices[0]?.message;
    const content = message?.content ?? null;
    const tool_calls = message?.tool_calls;

    if (!content && !tool_calls) {
      throw new Error("OpenAI returned empty response");
    }

    return { content, tool_calls };
  }
}
