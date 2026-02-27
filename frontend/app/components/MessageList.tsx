import ReactMarkdown from "react-markdown";
import { Message } from "./types/Message";
import remarkGfm from "remark-gfm";
import VideoIcon from "./icons/VideoIcon";
import WebIcon from "./icons/WebIcon";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function MessageList({
  messageList,
}: {
  messageList: Message[] | [];
}) {
  return (
    <div className="flex flex-col items-stretch h-full p-10 min-w-0">
      {messageList.map((message, index) => (
        <div
          key={index}
          className={`relative px-4 py-2 rounded-lg mb-2 min-w-0
            ${message.sender === "user" ? 
              " max-w-[85%] w-fit ml-auto self-end bg-zinc-600/30 text-white rounded-tr-none" :
              " max-w-full mr-auto"}            
            `}
        >
          {message.type === "error" ? (
            <span className="text-red-500 text-sm">
              Erro: {message.content}
            </span>
          ) : (
            <div>
              <article
                className={`space-y-2 wrap-anywhere min-w-0 ${message.state === "streaming" ? "is-streaming" : ""}`}
              >
                <ReactMarkdown
                  children={message.content}
                  remarkPlugins={[remarkGfm]}
                  disallowedElements={["img", "iframe", "script"]}
                  components={{
                    a: ({ node, ...props }: any) => {
                      return (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1 py-1 inline-flex items-center px-1.5  rounded-md bg-white/10  text-[10px] uppercase font-bold  text-white/70 align-middle hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                        >
                          {props.href.includes("youtube.com") ? (
                            <VideoIcon className="w-3 min-w-3 max-h-5" />
                          ) : (
                            <WebIcon className="w-3 min-w-3 max-h-5" />
                          )}
                          <span className="truncate text-wrap">{props.children}</span>
                        </a>
                      );
                    },
                    ul: ({ ...props }) => (
                      <ul className="list-disc list-outside pl-6" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        className="list-decimal list-outside pl-6"
                        {...props}
                      />
                    ),
                    li: ({ ...props }) => (
                      <li className="[&>p]:inline [&>p]:m-0" {...props} />
                    ),
                    h1: ({ ...props }) => (
                      <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-lg font-bold mt-2 mb-1" {...props} />
                    ),
                    code: ({ className, children, ...props }) => {
                      const isInline = !className;
                      const match = /language-(\w+)/.exec(className || "");

                      if (isInline) {
                        return (
                          <code
                            className="bg-gray-700 px-1 rounded text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <SyntaxHighlighter
                          language={match?.[1] ?? "text"}
                          PreTag="div"
                          style={atomDark}
                          customStyle={{ margin: 0, overflowX: "auto", maxWidth: "100%" }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      );
                    },
                    pre: ({ ...props }) => (
                      <pre
                        className="rounded-md shadow-md overflow-x-auto max-w-full min-w-0"
                        {...props}
                      />
                    ),
                  }}
                />
              </article>

              {message.state === "loading" && (
                <div className="flex w-full space-x-1 justify-start items-center animate-pulse">
                  <span className="sr-only">Loading...</span>
                  <div className="size-1 bg-white rounded-full animate-bounce [animation-delay:-0.5s]"></div>
                  <div className="size-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="size-1 bg-white rounded-full animate-bounce"></div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
