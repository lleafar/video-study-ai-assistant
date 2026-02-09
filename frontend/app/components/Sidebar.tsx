"use client";

import { useState } from "react";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  return (
    <aside className="h-screen flex flex-col bg-zinc-900/50 shadow-md">
      <div className="flex items-center justify-center h-16 py-20">
        <a onClick={() => setIsDrawerOpen((prev) => !prev)}>a</a>
      </div>
      <nav
        className="flex-1 flex flex-col mt-10 w-60 max-w-60"
        hidden={!isDrawerOpen}
      >
        <div className="px-3 py-2 text-xs text-gray-400 uppercase font-semibold">
          <span>Sessões</span>
        </div>
        <div className="gap-4">
          <SidebarItem route="/1" label="Consultas" />
        </div>
      </nav>
    </aside>
  );
}
