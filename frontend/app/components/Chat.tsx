"use client";

import { useEffect, useState } from "react";
import MessageList from "./MessageList";
import { useChatStream } from "../../hooks/useChatStream";
import { useChatStore } from "@/store/useChatStore";
import { Message } from "./types/Message";

export default function Chat() {
  const [message, setMessage] = useState("");
  const videoUrl = useChatStore((s) => s.getCurrentSession()?.videoUrl ?? "");
  const messages: Message[] = useChatStore(
    (s) => s.getCurrentSession()?.messages,
  );
  const { sendMessage, isLoading } = useChatStream();

  function handleSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (message.trim() === "") return;
    sendMessage(videoUrl, message);
    setMessage("");
  }

  function scrollToBottom() {
    const container = document.getElementById("message-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {videoUrl === "" ? (
        <div className="flex flex-col justify-center items-center w-md h-full">
          <div className="flex gap-2 text-xl">    
            <p className="text-gray-400">
              Cole o link de um vídeo do YouTube para começar a conversar!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-end items-center h-full w-[80%] max-w-225">
          <div id="message-container" className="overflow-y-auto">
            <MessageList messageList={messages} />
          </div>
          <form onSubmit={handleSubmitMessage} className="w-full mt-5 p-5">
            <input
              type="text"
              placeholder="Pergunte alguma coisa"
              className="rounded-full border px-5 py-2 text-start w-full"
              disabled={isLoading}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </form>
        </div>
      )}
    </div>
  );
}
