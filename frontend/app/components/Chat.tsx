"use client";

import { useState } from "react";
import MessageList from "./MessageList";
import { Message } from "./types/Message";
import { useChatStream } from "../../hooks/useChatStream";

export default function Chat() {
  const [message, setMessage] = useState("");
  const { sendMessage, messages, isLoading } = useChatStream({ messagesList: [
        {
      content: "Olá, em que posso ajudar?",
      sender: "assistant",
    },
    {
      content: "Olá, gostaria de um resumo do vídeo que estou assistindo",
      sender: "user",
    },
    {
      content: "Claro, posso ajudar com isso! Por favor, me forneça o link do vídeo que você está assistindo para que eu possa gerar um resumo para você.",
      sender: "assistant",
    }
  ] });

  function handleSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (message.trim() === "") return;
    sendMessage("", message);
    setMessage("");
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="flex flex-col justify-baseline items-center w-xs sm:w-sm md:w-md lg:w-5xl h-full">
        <div className="overflow-auto">
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
