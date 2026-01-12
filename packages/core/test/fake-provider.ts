import { Provider, ChatRequest, ChatResponse } from "../src/providers/Provider.js";

export class FakeProvider implements Provider {
  id = "fake";
  private replies: (string | ChatResponse)[];

  constructor(replies: (string | ChatResponse)[] = []) {
    this.replies = replies;
  }

  public lastRequest?: ChatRequest;

  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.lastRequest = request;
    const reply = this.replies.shift() ?? "default reply";
    if (typeof reply === "string") {
      return { content: reply };
    }
    return reply;
  }

  async *stream(request: ChatRequest) {
    this.lastRequest = request;
    const reply = this.replies.shift() ?? "default reply";
    
    if (typeof reply === "string") {
      const words = reply.split(" ");
      for (const word of words) {
        yield { content: word + (word === words[words.length - 1] ? "" : " ") };
      }
    } else {
      if (reply.content) {
        const words = reply.content.split(" ");
        for (const word of words) {
          yield { content: word + (word === words[words.length - 1] ? "" : " ") };
        }
      }
      
      // Yield reasoning and tool_calls in the last chunk
      yield { 
        content: "", 
        reasoning: reply.reasoning || undefined, 
        tool_calls: reply.tool_calls 
      };
    }
  }

  defaultModel(_feature?: string): string {
    return "fake-default-model";
  }
}
