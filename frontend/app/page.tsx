"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import ModalSelectUrl from "@/app/components/ModalSelectUrl";
import { Attachment } from "@/app/components/types/Attachment";
import AttachmentBadge from "@/app/components/AttachmentBadge";
import { useUrlTitle } from "@/hooks/useUrlTitle";
import { validateYouTubeUrl } from "./utils/url-utils";
import AttachURLsButton from "./components/AttachURLsButton";
import AttachFiles from "./components/AttachFiles";

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const addSession = useChatStore((s) => s.addSession);

  const { getTitle, isLoading } = useUrlTitle();

  const [attachedUrls, setAttachedUrls] = useState<Attachment[]>([]);
  const [inputVideoUrl, setInputVideoUrl] = useState("");

  const router = useRouter();

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (
        text &&
        validateYouTubeUrl(text) &&
        inputVideoUrl === ""        
      ) {
        if(attachedUrls.some((a) => a.url === text)) {
          setAttachedUrls(attachedUrls.filter((a) => a.url !== text));
        }
        
        setInputVideoUrl(text);
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  const handleIniciarConversa = async () => {
    if (inputVideoUrl.trim() === "") {
      alert("Por favor, insira o URL de um vídeo para iniciar a conversa.");
      return;
    }

    const videoUrl = inputVideoUrl.trim();

    if (!validateYouTubeUrl(videoUrl)) {
      alert(
        "URL inválida. Por favor, insira um URL de vídeo do YouTube válido.",
      );
      return;
    }

    const id = Date.now().toString();

    const title = await getTitle(videoUrl).catch(() => videoUrl);

    const video: Attachment = {
      url: videoUrl,
      title,
    };

    const newSession = {
      id,
      title: video.title || video.url,
      videoUrl: video.url,
      contextUrls: attachedUrls,
      messages: [],
    };

    startTransition(() => {
      addSession(newSession);
      router.push(`/chat/${newSession.id}`);
    });
  };

  return (
    <main className="h-screen flex-1 flex justify-center items-start ">
      <div className="flex flex-col w-[80%] justify-between items-center gap-20 mt-20">
        <div className="flex flex-col text-xl justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-10 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"
            />
          </svg>
          <p className="text-center">
            <span className="font-semibold text-gray-200">
              Adicione um vídeo para começar a conversar sobre seu conteúdo!
            </span>
            <br />
            <span className="text-gray-400 text-[15px] font-light">
              Anexe materiais de apoio e crie uma experiência completa de
              aprendizado.
            </span>
          </p>
        </div>
        <div className="relative z-0 w-full">
          <div className="grid grid-cols-2 md:grid-cols-6 sm:grid-cols-3 xs:grid-cols-2 grid-flow-col xs:grid-rows-2 w-full mb-4 max-h-20 gap-x-2 overflow-auto">            
            {attachedUrls.map((attachment, index) => (
              <AttachmentBadge
                key={index}
                className="text-[10px]"
                attachment={attachment}
                onClick={() =>
                  setAttachedUrls(attachedUrls.filter((_, i) => i !== index))
                }
              />
            ))}
          </div>
          <Input
            id="video_url_input"
            type="text"
            value={inputVideoUrl}
            // onChange={(e) => setVideoUrl(currentSessionId, e.target.value)}
            onChange={(e) => setInputVideoUrl(e.target.value)}
            onFocus={readClipboard}
          >
            Cole o URL de um vídeo do Youtube para começar a assistir
          </Input>
          <div className="flex mt-5 gap-2">
            <AttachFiles />
            <AttachURLsButton
              limit={3 - attachedUrls.length}
              onAttachmentsChange={(attachments) => {              
                if (!attachedUrls.some((a) => attachments.some((att) => att.url === a.url))) {                  
                  setAttachedUrls((prev) => [...prev, ...attachments]);
                }
              }}
            />
          </div>
          <div className="mt-10 w-full">
            <Button
              className="shrink-0 font-normal!"
              type="submit"
              onClick={handleIniciarConversa}
            >
              <p className="text-center w-full">Iniciar conversa</p>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
