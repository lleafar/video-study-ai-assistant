// import Chat from "./components/Chat";
import VideoPlayer from "./components/VideoPlayer";

export default function Home() {
  return (
    <main className="h-screen flex-1 flex justify-center items-start ">
      <div className="flex flex-col w-[80%] justify-between items-center gap-30 mt-25">
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
          <p className="font-semibold text-gray-200">
            Adicione um vídeo para começar a conversar sobre seu conteúdo!
          </p>
          <p className="text-gray-400 text-md font-light text-center">
            Anexe materiais de apoio e crie uma experiência completa de
            aprendizado.
          </p>
        </div>
        <VideoPlayer />
      </div>
    </main>
  );
}
