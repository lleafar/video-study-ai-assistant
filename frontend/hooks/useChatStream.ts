import { useState } from "react";
import { Message } from "../app/components/types/Message";
import { useChatStore } from "@/store/useChatStore";

export function useChatStream() {
  const [isLoading, setIsLoading] = useState(false);
  const currentSessionId = useChatStore((s) => s.currentSessionId);
  const updateSessionMessages = useChatStore((s) => s.updateSessionMessages);

  const sendMessage = async (videoUrl: string, message: string) => {
    setIsLoading(true);

    // Add the user's message to the session messages immediately
    updateSessionMessages(currentSessionId, (prev) => [
      ...prev,
      { content: message, sender: "user" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl, message }),
      });

      if (!response.ok) {
        throw new Error(
          `Error from server: ${response.status} ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("No response body, unable to stream.");
      }

      if (!response.body.getReader) {
        throw new Error("Response body does not support streaming.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      const newMessage: Message = { content: "", sender: "assistant" };
      // Add an empty assistant message to the session to be updated with streaming content
      updateSessionMessages(currentSessionId, (prev) => [...prev, newMessage]);

      let assistantMessages = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const cleanedChunk = chunk.replace(/data: /g, "").replace(/\n\n/g, "");

        assistantMessages += cleanedChunk;

        // Update the last message in the session with the new content
        updateSessionMessages(currentSessionId, (prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          next[next.length - 1] = {
            content: assistantMessages,
            sender: "assistant",
          };
          return next;
        });
      }
    } catch (error) {
      console.log("Error sending message:", error);
      updateSessionMessages(currentSessionId, (prev) => [
        ...prev,
        {
          content: "Desculpe, ocorreu um erro ao enviar sua mensagem.",
          sender: "assistant",
          type: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
}
