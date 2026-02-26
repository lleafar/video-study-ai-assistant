import { useState } from "react";
import { Message } from "../app/components/types/Message";
import { useChatStore } from "@/store/useChatStore";
import { Attachment } from "@/app/components/types/Attachment";

export function useChatStream() {
  const [isLoading, setIsLoading] = useState(false);
  const currentSessionId = useChatStore((s) => s.currentSessionId);
  const updateSessionMessages = useChatStore((s) => s.updateSessionMessages);

  const sendMessage = async (videoUrl: string, contextURLs: Attachment[], message: string) => {
    setIsLoading(true);

    // Add the user's message to the session messages immediately
    updateSessionMessages(currentSessionId, (prev) => [
      ...prev,
      { content: message, sender: "user" },
    ]);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          chatId: currentSessionId,
          videoUrl, 
          contextURLs, 
          message 
        }),
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

      const newMessage: Message = { content: "⏳ Carregando...", sender: "assistant" };
      // Add an empty assistant message to the session to be updated with streaming content
      updateSessionMessages(currentSessionId, (prev) => [...prev, newMessage]);

      let assistantMessages = "";      
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split by newline to handle multiple SSE events
        const parts = buffer.split("\n\n");
        buffer = parts[parts.length - 1]; // Keep incomplete message in buffer

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith("data: ")) {
            try {
              const msgData = JSON.parse(part.slice(6)); // Remove "data: " prefix
              
              // Accumulate both types but show them differently
              if (msgData.type === "ai") {
                assistantMessages += msgData.content;
                
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
            } catch (e) {
              console.error("Failed to parse message:", part, e);
            }
          }
        }
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
