"use client";

import { useState } from "react";
import SidebarItem from "./SidebarItem";
import { useChatStore } from "@/store/useChatStore";
import Button from "./Button";

export default function Sidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const sessions = useChatStore((s) => s.sessions);

  return (
    <aside
      className={`h-screen flex flex-col bg-zinc-900/50 shadow-md transition-all duration-300 ease-in-out overflow-hidden ${
        isDrawerOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col items-center justify-center h-16 py-20 px-4 shrink-0">
        <button
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          className="hover:opacity-70 transition-opacity cursor-pointer"
        >
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
        </button>
      </div>
      {/* <div className="px-3 text-xs uppercase font-semibold shrink-0"> */}
      <Button className="text-md">
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
              isDrawerOpen
                ? "opacity-100 w-auto"
                : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Novo chat
          </p>        
      </Button>
      {/* </div> */}
      <nav className="flex-1 flex flex-col mt-10 overflow-hidden">
        <div
          className={`transition-all duration-300 ${
            isDrawerOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full invisible"
          }`}
        >
          <div className="px-3 py-2 text-xs text-gray-400 uppercase font-semibold">
            <span>Chats</span>
          </div>
          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
              <SidebarItem
                key={session.id}
                route={`/chat/${session.id}`}
                label={
                  session.messages.length > 0
                    ? session.messages[0].content.substring(0, 40)
                    : ""
                }
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
