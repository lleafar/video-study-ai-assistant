"use client";

import { useEffect, useState } from "react";
import MessageList from "@/app/components/MessageList";
import { useChatStream } from "@/hooks/useChatStream";
import { useChatStore } from "@/store/useChatStore";
import { Message } from "@/app/components/types/Message";
import Button from "./Button";
import Input from "./Input";
import AttachmentBadge from "./AttachmentBadge";
import { Attachment } from "./types/Attachment";
import AttachURLsButton from "./AttachURLsButton";
import AttachFiles from "./AttachFiles";

function PlusIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function SendIcon({ className = "size-6" }: { className?: string }) {
  return (
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
        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
      />
    </svg>
  );
}

function PencilIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
      />
    </svg>
  );
}

function MenuSelect({ limit }: { limit?: number }) {
  return (
    <div className="group relative inline-block">
      <div className="z-10 absolute hidden group-focus-within:block bottom-10 bg-zinc-800 rounded shadow-lg w-50">
        <ul className="py-1 text-sm text-gray-200">
          <li>
            <Button
              className="hover:rounded-none! rounded-none!"
              styleType="secondary"
              disabled
            >
              <PencilIcon className="size-4" />
              <p className="w-full">Alterar vídeo principal</p>
            </Button>
          </li>
          <li>
            <AttachFiles className="hover:rounded-none! rounded-none bg-none p-2" />
          </li>
          <li>
            <AttachURLsButton
              limit={limit}
              classNameButton="hover:rounded-none! rounded-none!"
              styleType="secondary"
            />
          </li>
          <li></li>
        </ul>
      </div>
      <Button
        className="hover:rounded-r-none rounded-r-none group"
        styleType="secondary"
        type="button"
      >
        <PlusIcon />
      </Button>
    </div>
  );
}

export default function Chat({ isStacked = false }: { isStacked?: boolean }) {
  const [message, setMessage] = useState("");
  const videoUrl = useChatStore((s) => s.getCurrentSession()?.videoUrl ?? "");
  const messages: Message[] = useChatStore(
    (s) => s.getCurrentSession()?.messages,
  );
  const { sendMessage, isLoading } = useChatStream();
  // const [attachedUrls, setAttachedUrls] = useState<Attachment[]>([]);
  const attachedUrls = useChatStore(
    (s) => s.getCurrentSession()?.contextUrls ?? [],
  );
  const updateSessionContextUrls = useChatStore(
    (s) => s.updateSessionContextUrls,
  );

  function handleSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (message.trim() === "") return;
    sendMessage(videoUrl, attachedUrls, message);
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
          <div id="message-container" className="overflow-y-auto w-full h-full">
            <MessageList              
              messageList={messages}
            />          
          </div>
          <div className="w-full p-5">
            <div
              className={`grid grid-cols-1 w-full max-h-20 gap-x-2 overflow-y-auto
              ${isStacked ? "grid-flow-col md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2" : "grid-flow-row md:grid-cols-3 sm:grid-cols-1 sm:grid-flow-row"}
            `}
            >
              {attachedUrls.map((attachment, index) => (
                <AttachmentBadge
                  key={index}
                  className="text-[10px]"
                  attachment={attachment}
                  onClick={() =>
                    updateSessionContextUrls(
                      attachedUrls.filter((_, i) => i !== index),
                    )
                  }
                />
              ))}
            </div>
            <form onSubmit={handleSubmitMessage} className="w-full pt-2">
              <div className="flex rounded-full border gap-3">
                <MenuSelect limit={3 - attachedUrls.length} />
                <input
                  type="text"
                  placeholder="Pergunte alguma coisa"
                  className="text-start w-full outline-none"
                  disabled={isLoading}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  className="hover:rounded-l-none rounded-l-none"
                  styleType="secondary"
                >
                  <SendIcon />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
