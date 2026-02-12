"use client";

import { useEffect, useState } from "react";
import MessageList from "./MessageList";
import { useChatStream } from "../../hooks/useChatStream";
import { useChatStore } from "@/store/useChatStore";

export default function Chat() {
  const [message, setMessage] = useState("");
  const videoUrl = useChatStore((s) => s.getCurrentSession()?.videoUrl ?? "");
  const messages = useChatStore((s) => s.getCurrentSession()?.messages ?? []);
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
      <div className="flex flex-col justify-end items-center w-xs sm:w-sm md:w-md lg:w-5xl h-full">
        <div id="message-container" className="overflow-y-auto">
          <MessageList messageList={messages} />
        </div>
        <form onSubmit={handleSubmitMessage} className="w-full mt-5 p-5">
          <input
            type="text"
            placeholder="Pergunte alguma coisa"
            className="rounded-full border px-5 py-2 text-start w-full"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
