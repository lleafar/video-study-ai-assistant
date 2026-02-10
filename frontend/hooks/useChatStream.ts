import { useState } from "react";
import { Message } from "../app/components/types/Message";

export function useChatStream({ messagesList }: { messagesList: Message[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(messagesList);

  const sendMessage = async (videoUrl: string, message: string) => {
    setIsLoading(true);

    setMessages(prev => [...prev, { content: message, sender: "user" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl, message }),
      });

      if (!response.body) {
        throw new Error("No response body, unable to stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      const newMessage: Message = { content: "", sender: "assistant" };
      setMessages(prev =>[...prev, newMessage]);

      let assistantMessages = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const cleanedChunk = chunk.replace(/data: /g, "").replace(/\n\n/g, "");

        assistantMessages += cleanedChunk;

        setMessages(prev => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex] = {
            content: assistantMessages,
            sender: "assistant",
          };
          return updatedMessages;
        });

      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, messages, isLoading };
}
