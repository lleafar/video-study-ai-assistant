import Button from "@/app/components/Button";
import { Attachment } from "@/app/components/types/Attachment";

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

function WwwIcon({ className }: { className?: string }) {
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
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 72 72"
      fill="none"
    >
      <path
        d="M61.1026 23.7185C60.5048 21.471 58.7363 19.6981 56.4863 19.0904C52.4181 18 36.0951 18 36.0951 18C36.0951 18 19.7805 18 15.7039 19.0904C13.4622 19.6897 11.6937 21.4627 11.0876 23.7185C10 27.7971 10 36.3124 10 36.3124C10 36.3124 10 44.8276 11.0876 48.9063C11.6854 51.1537 13.4539 52.9267 15.7039 53.5343C19.7805 54.6247 36.0951 54.6247 36.0951 54.6247C36.0951 54.6247 52.4181 54.6247 56.4863 53.5343C58.728 52.935 60.4965 51.162 61.1026 48.9063C62.1902 44.8276 62.1902 36.3124 62.1902 36.3124C62.1902 36.3124 62.1902 27.7971 61.1026 23.7185Z"
        fill="#FF3000"
      />
      <path
        d="M30.8811 44.1617L44.4392 36.3124L30.8811 28.463V44.1617Z"
        fill="white"
      />
    </svg>
  );
}
export default function AttachmentBadge({
  className,
  attachment,
  onClick,
}: {
  className?: string;
  attachment: Attachment;
  onClick: () => void;
}) {
  return (
    <div
      className={`flex justify-between items-center rounded-full bg-zinc-900/50 mb-1 ${className ?? ""}`}
    >
      <a
        href={attachment.url}
        target="_blank"
        className="truncate text-indigo-300 pl-4"
      >
        <div className="flex items-center gap-1">          
          {attachment.url.includes("youtube.com") ? (
            <VideoIcon className="w-4 min-w-4" />
          ) : (
            <WwwIcon className="w-3 min-w-3" />
          )}
          <p className="truncate">{attachment.title || attachment.url}</p>
        </div>
      </a>
      <Button onClick={onClick} styleType="tertiary">
        <CloseIcon className="size-4" />
      </Button>
    </div>
  );
}
