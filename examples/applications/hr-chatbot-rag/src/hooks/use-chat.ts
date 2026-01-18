import { useState } from "react";
import { sendMessage, sendMessageStream } from "@/app/chat-actions";

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | null;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function append(content: string) {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendMessage(chatId, content);
      setChatId(result.chatId);
      
      const assistantMessage: Message = {
        id: result.message.id,
        role: "assistant",
        content: result.message.content ?? null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function appendStream(content: string) {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantId = Math.random().toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const stream = await sendMessageStream(chatId, content);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let firstTokenReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === "chatId") {
              setChatId(data.chatId);
            } else if (data.type === "token") {
              // Hide loader as soon as first token arrives
              if (!firstTokenReceived) {
                setIsLoading(false);
                firstTokenReceived = true;
              }
              
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: (msg.content || "") + data.content }
                    : msg
                )
              );
            } else if (data.type === "error") {
              console.error("Stream error:", data.message);
              setIsLoading(false);
            }
          } catch (e) {
            console.error("Failed to parse stream chunk:", e);
          }
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    messages,
    isLoading,
    append,
    appendStream,
    chatId
  };
}
