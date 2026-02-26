import { useState } from "react";
import Button from "./Button";
import ModalSelectUrl from "./ModalSelectUrl";
import { Attachment } from "./types/Attachment";

function AttachURLIcon() {
  return (
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
  );
}

export default function AttachURLsButton({
  limit,
  onAttachmentsChange,
  classNameButton,
  styleType = "primary",
}: {
  limit?: number;
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  classNameButton?: string;
  styleType?: "primary" | "secondary";
}) {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [attachedUrls, setAttachedUrls] = useState<Attachment[]>([]);

  return (
    <>
      <Button
        disabled={limit !== undefined && limit <= 0}
        className={"py-1 " + classNameButton}
        styleType={styleType}
        onClick={() => {
          if (limit === 0) {
            alert(
              "Limite de anexos atingido. Você pode anexar no máximo 3 URLs.",
            );
            return;
          }
          setIsUrlModalOpen(true);
        }}
      >
        <AttachURLIcon />
        <p>Anexar URLs</p>
      </Button>
      <ModalSelectUrl
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onAttachmentsChange={(attachments) => {
          if (limit !== undefined && attachments.length > limit) {
            alert(
              `Você pode anexar no máximo ${limit} URLs. Você selecionou ${attachments.length} URLs.`,
            );
            return;
          }
          setAttachedUrls((prev) => [...prev, ...attachments]);
          if (onAttachmentsChange) {
            onAttachmentsChange(attachments);
          }
        }}
      />
    </>
  );
}
