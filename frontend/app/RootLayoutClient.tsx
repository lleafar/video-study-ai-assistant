"use client";

import { useSidebarStore } from "@/store/useSidebarStore";
import Sidebar from "@/app/components/Sidebar";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
    const isOpen = useSidebarStore((s) => s.isOpen);

  return (
    <div className={"min-h-screen flex"}>
        <Sidebar />
        <main className={`flex-1 ${isOpen ? "ml-64" : "ml-16"} transition-all duration-300 ease-in-out`}>
            {children}
        </main>
    </div>
  );
}