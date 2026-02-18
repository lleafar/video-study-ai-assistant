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
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"
                />
              </svg>
            </span>
            <p className="text-gray-400">
              Cole o link de um vídeo do YouTube para começar a conversar!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-end items-center w-xs sm:w-sm md:w-md lg:w-5xl h-full">
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
