"use client";
import { useChatStore } from "@/store/useChatStore";
import ReactPlayer from "react-player";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

export default function VideoPlayer() {
  const videoUrl = useChatStore((s) => s.getCurrentSession()?.videoUrl ?? "");
  const setVideoUrl = useChatStore((s) => s.updateSessionVideoUrl);
  const currentSessionId = useChatStore((s) => s.currentSessionId);

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (
        text &&
        text.includes("youtube.com") &&
        text.includes("watch?v=") &&
        videoUrl === ""
      ) {
        setVideoUrl(currentSessionId, text);
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full max-w-6xl">
      {videoUrl === "" ? (
        <div className="relative z-0 w-full">
          <input
            onFocus={readClipboard}
            type="text"
            id="video_url"
            className="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(currentSessionId, e.target.value);
            }}
          />
          <label
            htmlFor="video_url"
            className="absolute text-zinc-400 peer-focus:text-white text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >
            Cole o URL de um vídeo do Youtube para começar a assistir
          </label>
          <div className="flex mt-5 gap-2">
            <Input
              className="bg-zinc-950/30 py-1 px-4"
              type="file"
              accept="video/*,.pdf,.doc,.docx,.txt"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>

              <p>Anexar arquivos</p>
            </Input>
            <Button className="bg-zinc-950/30 py-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
              <p>Adicionar URLs</p>
            </Button>
          </div>
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
