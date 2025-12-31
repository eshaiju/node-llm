import { describe, it, expect, vi } from "vitest";
import { Chat } from "../src/chat/Chat.js";
import { FakeProvider } from "./fake-provider.js";
import { FakeStreamingProvider } from "./fake-streaming-provider.js";

describe("Chat Events", () => {
  it("triggers onNewMessage and onEndMessage for non-streaming requests", async () => {
    const provider = new FakeProvider(["Hello world"]);
    const chat = new Chat(provider, "test-model");

    const onNewMessage = vi.fn();
    const onEndMessage = vi.fn();

    chat
      .onNewMessage(onNewMessage)
      .onEndMessage(onEndMessage);

    await chat.ask("Hello");

    expect(onNewMessage).toHaveBeenCalledTimes(1);
    expect(onEndMessage).toHaveBeenCalledTimes(1);
    
    // Verify payload of onEndMessage
    const endMsg = onEndMessage.mock.calls[0][0];
    expect(endMsg.content).toBe("Hello world");
    expect(endMsg.model).toBe("test-model");
  });

  it("triggers onNewMessage and onEndMessage for streaming requests", async () => {
    const provider = new FakeStreamingProvider();
    const chat = new Chat(provider, "test-stream-model");

    const onNewMessage = vi.fn();
    const onEndMessage = vi.fn();

    chat
      .onNewMessage(onNewMessage)
      .onEndMessage(onEndMessage);

    const streamer = chat.stream("Hello stream");
    for await (const _chunk of streamer) {
      // Consume stream
    }

    expect(onNewMessage).toHaveBeenCalledTimes(1);
    expect(onEndMessage).toHaveBeenCalledTimes(1);

    // Verify payload of onEndMessage
    const endMsg = onEndMessage.mock.calls[0][0];
    expect(endMsg.content).toBe("Hello world");
    expect(endMsg.model).toBe("test-stream-model");
  });
});
