"use client";

import Chat from "@/app/components/Chat";
import VideoPlayer from "@/app/components/VideoPlayer";
import { use, useEffect, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import SwitchLayoutButton from "@/app/components/SwitchLayoutButton";
import Button from "@/app/components/Button";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isStacked, setIsStacked] = useState(true);
  const setCurrentSessionId = useChatStore((s) => s.setCurrentSessionId);

  useEffect(() => {
    setCurrentSessionId(id);
  }, [id, setCurrentSessionId]);

  return (
    <main className="h-screen flex-1 flex flex-col relative">
      <div
        className={`flex-1 overflow-hidden grid ${isStacked ? "grid-cols-1 grid-rows-2" : "grid-cols-2 grid-rows-1"} gap-0`}
      >
        <div className={`flex justify-center w-full h-auto bg-black overflow-auto`}>
          <VideoPlayer />
        </div>
        <div className="w-full h-auto overflow-auto">
          <Chat />
        </div>
      </div>

      <div className="absolute bottom-0 right-0 m-5">
      <Button
        onClick={() => setIsStacked(!isStacked)}  
        className=""      
      >
        <SwitchLayoutButton isStacked={isStacked} />
      </Button>
      </div>
    </main>
  );
}
