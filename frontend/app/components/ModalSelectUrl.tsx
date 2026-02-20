import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { useUrlTitle } from "@/hooks/useUrlTitle";
import { useState } from "react";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}

function UrlItemSkeleton() {
  return (                    
    <div className="px-4 py-4 flex justify-between items-center rounded-full bg-zinc-900/50 mb-2 animate-pulse">
      <div className="flex-1 h-4 bg-zinc-700/50 rounded"></div>
      <div className="mx-4 size-4 bg-zinc-700/50 rounded"></div>
    </div>
  );
}

type UrlData = {
  url: string;
  title: string;
};

export default function ModalSelectUrl({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [urls, setUrls] = useState<UrlData[]>([]);

  const { getTitle, isLoading } = useUrlTitle();

  const handleAddUrls = async () => {
    if (inputValue.trim() !== "") {
      if (!/^https?:\/\/\S+$/.test(inputValue.trim())) {
        setErrorMessage("URL inválida. Por favor, insira uma URL válida.");
        return;
      }
      setErrorMessage("");

      const newUrls = inputValue
        .split(/\s+/)
        .filter((url) => url.trim() !== "");

      const newUrlsWithTitles = await Promise.all(
        newUrls.map(async (url) => {
          const title = await getTitle(url);
          return { url, title };
        }),
      );
      setUrls((prev) => [...prev, ...newUrlsWithTitles]);

      setInputValue("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-zinc-800 p-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Adicionar URLs</h2>
          <Button onClick={onClose} styleType="tertiary">
            <CloseIcon className="size-6" />
          </Button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddUrls();
          }}
        >
          <Input
            id="video_url_input_modal"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          >
            Digite ou cole as URLs aqui...
          </Input>
          <span>
            {errorMessage && (
              <p className="text-red-500/90 text-xs mt-1">{errorMessage}</p>
            )}
          </span>
          <div className="h-100 min-h-10 max-h-100 overflow-y-auto bg-zinc-900/30 rounded-md my-4 p-5">
            {urls.map((data, index) => (
              <div
                key={index}
                className="px-4 py-2 flex justify-between items-center rounded-full bg-zinc-900/50 mb-2"
              >
                <a
                  href={data.url}
                  target="_blank"
                  className="truncate text-indigo-300 underline"
                >
                  {data.title || data.url}
                </a>
                <Button
                  onClick={() => setUrls(urls.filter((_, i) => i !== index))}
                  styleType="tertiary"
                >
                  <CloseIcon className="size-4" />
                </Button>
              </div>
            ))}
            {isLoading && <UrlItemSkeleton />}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={(e) => {
                handleAddUrls();
                onClose();
              }}
              styleType="secondary"
              type="submit"
            >
              Adicionar{" "}
            </Button>
            <Button onClick={handleAddUrls} styleType="primary" type="submit">
              Adicionar outro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
