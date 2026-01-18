import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssistantChat } from "@/models/assistant-chat";
import { prisma } from "@/lib/db";
import { llm } from "@/lib/node-llm";

// Mock NodeLLM to avoid real API calls
vi.mock("@/lib/node-llm", () => ({
  llm: {
    chat: vi.fn(() => {
      const mockChat = {
        system: vi.fn(),
        add: vi.fn(),
        ask: vi.fn().mockResolvedValue({
          content: "I am an assistant",
          meta: { id: "msg_123" },
          inputTokens: 10,
          outputTokens: 20,
          model: "gpt-4o",
          provider: "openai",
        }),
        onToolCallStart: vi.fn().mockReturnThis(),
        onToolCallEnd: vi.fn().mockReturnThis(),
        onToolCallError: vi.fn().mockReturnThis(),
        beforeRequest: vi.fn().mockReturnThis(),
        afterResponse: vi.fn().mockReturnThis(),
        onEndMessage: vi.fn().mockReturnThis(),
      };
      // Make the hooks chainable
      mockChat.onToolCallStart.mockReturnValue(mockChat);
      mockChat.onToolCallEnd.mockReturnValue(mockChat);
      mockChat.onToolCallError.mockReturnValue(mockChat);
      mockChat.beforeRequest.mockReturnValue(mockChat);
      mockChat.afterResponse.mockReturnValue(mockChat);
      mockChat.onEndMessage.mockReturnValue(mockChat);
      return mockChat;
    }),
    withProvider: vi.fn().mockReturnThis(),
  },
}));

describe("AssistantChat Persistence", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.assistantMessage.deleteMany();
    await prisma.assistantChat.deleteMany();
    vi.clearAllMocks();
  });

  it("should persist user and assistant messages on successful ask", async () => {
    const chat = await AssistantChat.create({
      instructions: "You are a helpful HR bot.",
      model: "gpt-4o",
    });

    const response = await chat.ask("What is our leave policy?");

    expect(response.content).toBe("I am an assistant");

    // Verify messages in DB
    const messages = await chat.messages();
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("user");
    expect(messages[0].content).toBe("What is our leave policy?");
    expect(messages[1].role).toBe("assistant");
    expect(messages[1].content).toBe("I am an assistant");
    expect(messages[1].inputTokens).toBe(0);
  });

  it("should cleanup the empty assistant message if the API call fails", async () => {
    // Manually setup the failure for this specific test
    const mockChat = {
        system: vi.fn(),
        add: vi.fn(),
        ask: vi.fn().mockRejectedValue(new Error("API Timeout")),
        onToolCallStart: vi.fn().mockReturnThis(),
        onToolCallEnd: vi.fn().mockReturnThis(),
        onToolCallError: vi.fn().mockReturnThis(),
        beforeRequest: vi.fn().mockReturnThis(),
        afterResponse: vi.fn().mockReturnThis(),
        onEndMessage: vi.fn().mockReturnThis(),
    };
    mockChat.onToolCallStart.mockReturnValue(mockChat);
    mockChat.onToolCallEnd.mockReturnValue(mockChat);
    mockChat.onToolCallError.mockReturnValue(mockChat);
    mockChat.beforeRequest.mockReturnValue(mockChat);
    mockChat.afterResponse.mockReturnValue(mockChat);
    mockChat.onEndMessage.mockReturnValue(mockChat);
    
    vi.spyOn(llm, "chat").mockReturnValue(mockChat as any);

    const chat = await AssistantChat.create();

    await expect(chat.ask("Fail me")).rejects.toThrow("API Timeout");

    // Verify user message persists but assistant message is gone
    const messages = await chat.messages();
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");
    // Verify assistant message is deleted (no second message)
    expect(messages.find(m => m.role === 'assistant')).toBeUndefined();
  });

  it("should persist tool execution details", async () => {
    let capturedToolStartCallback: Function | undefined;
    let capturedToolEndCallback: Function | undefined;
    let capturedAfterResponseCallback: Function | undefined;

    // Advanced Mock: Capture the hook
    // Advanced Mock: Capture the hook
    const mockChat = {
      system: vi.fn(),
      add: vi.fn(),
      onToolCallStart: vi.fn().mockImplementation((cb) => {
        capturedToolStartCallback = cb;
        return mockChat;
      }),
      onToolCallEnd: vi.fn().mockImplementation((cb) => {
        capturedToolEndCallback = cb;
        return mockChat;
      }),
      onToolCallError: vi.fn().mockReturnThis(),
      beforeRequest: vi.fn().mockReturnThis(),
      afterResponse: vi.fn().mockImplementation((cb) => {
         capturedAfterResponseCallback = cb;
         return mockChat;
      }),
      onEndMessage: vi.fn().mockReturnThis(),
      ask: vi.fn().mockImplementation(async () => {
        // Simulate a tool completing during the turn
        if (capturedToolStartCallback && capturedToolEndCallback) {
          const toolCall = { id: "call_123", function: { name: "search_hr", arguments: '{"query":"payout"}' } };
          await capturedToolStartCallback(toolCall);
          await capturedToolEndCallback(
            toolCall,
            "Tool Result Data"
          );
        }
        
        // Simulate response hook
        if (capturedAfterResponseCallback) {
            await capturedAfterResponseCallback({ provider: 'openai', model: 'gpt-4o', usage: { input_tokens: 10, output_tokens: 5, cost: 0, total_tokens: 15 } });
        }
        
        return {
          content: "Here is the payout info.",
          meta: { id: "msg_2" },
          inputTokens: 15,
          outputTokens: 10,
          model: "gpt-4o",
          provider: "openai",
          usage: { input_tokens: 15, output_tokens: 10 }
        };
      }),
    };

    vi.spyOn(llm, "chat").mockReturnValue(mockChat as any);

    const chat = await AssistantChat.create();
    
    // Create a spy for persistence
    // Verify in DB directly instead of spying (integration style)
    await chat.ask("Check payout");

    const toolCalls = await prisma.assistantToolCall.findMany();
    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0].toolCallId).toBe("call_123");
    expect(toolCalls[0].name).toBe("search_hr");

    // Check request audit log
    const requests = await prisma.assistantRequest.findMany();
    expect(requests).toHaveLength(1);
    expect(requests[0].provider).toBe('openai');
    expect(requests[0].inputTokens).toBe(10);
  });

  it("should persist and retrieve JSON metadata correctly", async () => {
    const metadata = {
      source: "web-ui",
      sessionId: "sess_abc123",
      tags: ["hr-policy", "test"],
      config: {
        theme: "dark",
        language: "en"
      }
    };

    const chat = await AssistantChat.create({
      instructions: "You are helpful.",
      model: "gpt-4o",
      metadata
    });

    // Verify metadata was stored
    const chatRecord = await prisma.assistantChat.findUnique({
      where: { id: chat.id }
    });

    expect(chatRecord).not.toBeNull();
    expect(chatRecord!.metadata).toEqual(metadata);
    
    // Verify it's stored as JSON, not a string
    expect(typeof chatRecord!.metadata).toBe("object");
    expect(chatRecord!.metadata).toHaveProperty("source", "web-ui");
    expect(chatRecord!.metadata).toHaveProperty("tags");
    expect((chatRecord!.metadata as any).tags).toEqual(["hr-policy", "test"]);
  });
});
