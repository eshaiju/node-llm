import { ModerationRequest, ModerationResponse } from "../Provider.js";
import { handleOpenAIError } from "./Errors.js";

export class OpenAIModeration {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async execute(request: ModerationRequest): Promise<ModerationResponse> {
    const response = await fetch(`${this.baseUrl}/moderations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: request.input,
        model: request.model || "omni-moderation-latest",
      }),
    });

    if (!response.ok) {
      await handleOpenAIError(response, request.model || "omni-moderation-latest");
    }

    return (await response.json()) as ModerationResponse;
  }
}
