export default function Input({
  className,
  children,
  type = "text",
  onChange,
  value,
  accept,
  multiple = false,
}: {
  className?: string;
  children?: React.ReactNode;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  accept?: string;
  multiple?: boolean;
}) {
  const baseStyles = "flex items-center rounded-full hover:bg-zinc-600/30 transition-colors text-sm";
  const linkStyles= "relative z-10  flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2";

  return (
    <div
      className={baseStyles + " " + (className || "")}
    >
      <input
        id="file-input"
        type={type}
        onChange={onChange}
        className={linkStyles}
        value={value}
        accept={accept}
        multiple={multiple}
        hidden
      />
      <label htmlFor="file-input" className="flex items-center gap-2 cursor-pointer">
        {children}
      </label>
        
      
    </div>
  );
}
