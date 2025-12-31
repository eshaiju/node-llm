import { ChatRequest, ChatResponse } from "../Provider.js";
import { GeminiGenerateContentRequest, GeminiGenerateContentResponse } from "./types.js";
import { Capabilities } from "./Capabilities.js";
import { handleGeminiError } from "./Errors.js";
import { GeminiChatUtils } from "./ChatUtils.js";

export class GeminiChat {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async execute(request: ChatRequest): Promise<ChatResponse> {
    const temperature = Capabilities.normalizeTemperature(request.temperature, request.model);
    const url = `${this.baseUrl}/models/${request.model}:generateContent?key=${this.apiKey}`;

    const { contents, systemInstructionParts } = await GeminiChatUtils.convertMessages(request.messages);

    const payload: GeminiGenerateContentRequest = {
      contents,
      generationConfig: {
        temperature: temperature ?? undefined,
        maxOutputTokens: request.max_tokens,
      },
    };

    if (systemInstructionParts.length > 0) {
      payload.systemInstruction = { parts: systemInstructionParts };
    }

    if (request.tools && request.tools.length > 0) {
      payload.tools = [
        {
          functionDeclarations: request.tools.map((t) => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          })),
        },
      ];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleGeminiError(response, request.model);
    }

    const json = (await response.json()) as GeminiGenerateContentResponse;
    const candidate = json.candidates?.[0];
    
    const content = candidate?.content?.parts
        ?.filter(p => p.text)
        .map(p => p.text)
        .join("\n") || null;
    
    const tool_calls = candidate?.content?.parts
      ?.filter((p) => p.functionCall)
      .map((p) => ({
        id: p.functionCall!.name,
        type: "function" as const,
        function: {
          name: p.functionCall!.name,
          arguments: JSON.stringify(p.functionCall!.args),
        },
      }));

    const usage = json.usageMetadata ? {
      input_tokens: json.usageMetadata.promptTokenCount,
      output_tokens: json.usageMetadata.candidatesTokenCount,
      total_tokens: json.usageMetadata.totalTokenCount,
    } : undefined;

    return { content, tool_calls, usage };
  }
}
