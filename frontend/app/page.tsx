import Chat from "./components/Chat";
import VideoPlayer from "./components/VideoPlayer";

export default function Home() {
  return (
   <main className="h-screen flex-1 flex flex-col">
        <div className="h-1/2 bg-zinc-900/30">
          <VideoPlayer/>        
        </div>
        <div className="h-1/2">
          <Chat/>
        </div>
   </main>
  );
}
