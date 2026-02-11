"use client";
import { useChatStore } from "@/store/useChatStore";
import ReactPlayer from "react-player";

export default function VideoPlayer() {
  const videoUrl = useChatStore((s) => s.videoUrl);
  const setVideoUrl = useChatStore((s) => s.setVideoUrl);

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (
        text &&
        text.includes("youtube.com") &&
        text.includes("watch?v=") &&
        videoUrl === ""
      ) {
        setVideoUrl(text);
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      {videoUrl === "" ? (
        <div className="relative z-0 w-full mx-10">
          <input
            onFocus={readClipboard}
            type="text"
            id="video_url"
            className="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <label
            htmlFor="video_url"
            className="absolute text-zinc-400 peer-focus:text-white text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >
            Cole o URL de um vídeo do Youtube para começar a assistir
          </label>
        </div>
      ) : (
        <ReactPlayer
          src={videoUrl}
          controls
          light
          autoPlay
          width={"100%"}
          height={"100%"}
        />
      )}
    </div>
  );
}
