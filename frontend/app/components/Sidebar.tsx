"use client";

import SidebarItem from "./SidebarItem";
import { useChatStore } from "@/store/useChatStore";
import Button from "@/app/components/Button";
import { useSidebarStore } from "@/store/useSidebarStore";

export default function Sidebar() {
  const sessions = useChatStore((s) => s.sessions);
  const isOpen = useSidebarStore((s) => s.isOpen);
  const toggleSidebar = useSidebarStore((s) => s.toggle);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col bg-zinc-900/50 shadow-lg transition-all duration-300 ease-in-out overflow-hidden 
        ${isOpen ? "w-64" : "w-16"}
        `}
    >
      <div className="flex flex-col items-center justify-center h-16 py-20 px-4 shrink-0">
        <Button onClick={() => toggleSidebar()} styleType="tertiary">
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
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </Button>
      </div>
      <Button className="text-md" styleType="secondary" route="/">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
        <p
          className={`whitespace-nowrap truncate transition-all duration-300 ${
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          Novo chat
        </p>
      </Button>
      <nav className="flex-1 flex flex-col mt-10 overflow-hidden">
        <div
          className={`transition-all duration-300 ${
            isOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full invisible"
          }`}
        >
          <div className="px-3 py-2 text-xs text-gray-400 uppercase font-semibold">
            <span>Chats</span>
          </div>
          <div className="flex flex-col h-90 gap-4 overflow-auto">
            {sessions.map((session) => (
              <SidebarItem
                key={session.id}
                route={`/chat/${session.id}`}
                label={
                  session.title ||
                  (session.messages.length > 0
                    ? session.messages[0].content.substring(0, 40)
                    : "")
                }
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
