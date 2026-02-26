import Input from "./Input";

function AttachFileIcon({ className = "size-6" }: { className?: string }) {
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
        d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
      />
    </svg>
  );
}

export default function AttachFiles({ className }: { className?: string }) {
  return (
    <Input
      className={`gap-1 px-4 ${className}`}
      type="file"
      accept="video/*,.pdf,.doc,.docx,.txt"
      disabled={true}
    >
      <AttachFileIcon />
      <p>Anexar arquivos</p>
    </Input>
  );
}
