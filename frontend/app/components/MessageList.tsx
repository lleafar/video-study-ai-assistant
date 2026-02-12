import ReactMarkdown from "react-markdown";
import { Message } from "./types/Message";
import remarkGfm from "remark-gfm";

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
          className={`relative px-4 py-2 rounded-lg mb-2             
            ${message.sender === "user" ? "bg-zinc-600/30 text-white self-end rounded-tr-none" : "self-start"}            
            `}
        >
          {message.type === "error" ? (
            <span className="text-red-500 text-sm">
              Erro: {message.content}
            </span>
          ) : (
            <article className="space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                disallowedElements={["img", "iframe", "script"]}
                components={{
                  ul: ({ ...props }) => (
                    <ul className="list-disc list-inside ml-2" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className="list-decimal list-inside ml-2" {...props} />
                  ),
                  li: ({ ...props }) => <li className="ml-2" {...props} />,
                  h1: ({ ...props }) => (
                    <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-lg font-bold mt-2 mb-1" {...props} />
                  ),
                  code: ({ className, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code
                        className="bg-gray-700 px-1 rounded text-sm"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-800 p-3 rounded overflow-x-auto"
                        {...props}
                      />
                    );
                  },
                  pre: ({ ...props }) => (
                    <pre
                      className="bg-gray-800 p-3 rounded overflow-x-auto"
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </article>
          )}
        </div>
      ))}
    </div>
  );
}
