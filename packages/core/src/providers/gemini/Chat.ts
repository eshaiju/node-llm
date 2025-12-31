import { ChatRequest, ChatResponse } from "../Provider.js";
import { GeminiContent, GeminiGenerateContentRequest, GeminiGenerateContentResponse, GeminiPart } from "./types.js";
import { Capabilities } from "./Capabilities.js";
import { handleGeminiError } from "./Errors.js";

export class GeminiChat {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async execute(request: ChatRequest): Promise<ChatResponse> {
    const temperature = Capabilities.normalizeTemperature(request.temperature, request.model);
    const url = `${this.baseUrl}/models/${request.model}:generateContent?key=${this.apiKey}`;

    const contents: GeminiContent[] = [];
    let systemInstructionParts: GeminiPart[] = [];

    for (const msg of request.messages) {
      if (msg.role === "system") {
        if (typeof msg.content === "string") {
          systemInstructionParts.push({ text: msg.content });
        }
      } else if (msg.role === "user" || msg.role === "assistant" || msg.role === "tool") {
        const parts: GeminiPart[] = [];

        if (msg.role === "tool") {
          // Map tool results to functionResponse
          parts.push({
            functionResponse: {
              name: msg.tool_call_id || "unknown", // Library expects tool_call_id to be name
              response: { result: msg.content },
            },
          });
          contents.push({ role: "user", parts }); // Results come from "user" role
        } else {
          const role = msg.role === "assistant" ? "model" : "user";
          
          if (typeof msg.content === "string" && msg.content) {
            parts.push({ text: msg.content });
          } else if (Array.isArray(msg.content)) {
            for (const part of msg.content) {
              if (part.type === "text") {
                parts.push({ text: part.text });
              }
            }
          }

          // Handle tool calls in assistant messages
          if (msg.role === "assistant" && msg.tool_calls) {
            for (const call of msg.tool_calls) {
              parts.push({
                functionCall: {
                  name: call.function.name,
                  args: JSON.parse(call.function.arguments),
                },
              });
            }
          }

          if (parts.length > 0) {
            contents.push({ role, parts });
          }
        }
      }
    }

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
    
    // Extract text
    const content = candidate?.content?.parts
        ?.filter(p => p.text)
        .map(p => p.text)
        .join("\n") || null;
    
    // Extract tool calls
    const tool_calls = candidate?.content?.parts
      ?.filter((p) => p.functionCall)
      .map((p) => ({
        id: p.functionCall!.name, // Using name as ID for Gemini
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

