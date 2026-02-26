import Button from "@/app/components/Button";
import { Attachment } from "@/app/components/types/Attachment";
import VideoIcon from "./icons/VideoIcon";
import WebIcon from "./icons/WebIcon";

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
            <WebIcon className="w-3 min-w-3" />
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
