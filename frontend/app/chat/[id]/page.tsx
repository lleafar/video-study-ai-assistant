import Chat from "@/app/components/Chat";
import VideoPlayer from "@/app/components/VideoPlayer";
import { use } from "react";
import ChatSync from "./ChatSync";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

  return (
   <main className="h-screen flex-1 flex flex-col">
        <ChatSync id={id} />
        <div className="h-1/2 bg-zinc-900/30">
          <VideoPlayer/>        
        </div>
        <div className="h-1/2">
          <Chat/>
        </div>
   </main>
  );
}
