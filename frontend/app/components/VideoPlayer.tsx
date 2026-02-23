import ReactPlayer from "react-player";

import { useChatStore } from "@/store/useChatStore";

export default function VideoPlayer() {
  const videoUrl = useChatStore((s) => s.getCurrentSession()?.videoUrl ?? "");

  return (
    <div className="flex justify-center items-center w-full h-full max-w-6xl">
        <ReactPlayer
          src={videoUrl}
          controls
          light
          autoPlay
          width={"100%"}
          height={"100%"}
        />
    </div>
  );
}
