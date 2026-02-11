import { Message } from "./types/Message";

export default function MessageList({
  messageList,
}: {
  messageList: Message[];
}) {
  return (
    <div className="flex flex-col items-center w-full h-full p-10">
      {messageList.map((message, index) => (
        <div
          key={index}
          className={`relative max-w-[80%] px-4 py-2 rounded-lg mb-2             
            ${message.sender === "user" ? "bg-zinc-600/30 text-white self-end rounded-tr-none" : "self-start"}            
            `}
        >
          {message.type === "error" ? (
            <span className="text-red-500 text-sm">
              Erro: {message.content}
            </span>
          ) : (
            message.content
          )}
        </div>
      ))}
    </div>
  );
}
