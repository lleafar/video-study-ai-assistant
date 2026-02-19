export default function Input({
  id,
  className,
  children,
  type = "text",
  value,
  accept,
  multiple = false,
  onChange,
  onFocus,
}: {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  type?: "text" | "file";
  value?: string;
  accept?: string;
  multiple?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  const styleType = {
    file: {
      base: "flex items-center rounded-full hover:bg-zinc-600/30 transition-colors text-sm",
      input:
        "relative z-10  flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2",
      label: "flex items-center gap-2 cursor-pointer",
    },
    text: {
      base: "relative min-w-0 flex items-center transition-colors",
      input:
        "block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer",
      label:
        "truncate w-full absolute text-zinc-400 peer-focus:text-white text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto",
    },
  };

  return (
    <div
      className={
        (styleType[type]?.base || styleType["text"].base) +
        " " +
        (className || "")
      }
    >
      <input
        id={id || "input-" + value}
        type={type}
        onChange={onChange}
        className={styleType[type]?.input || styleType["text"].input}
        value={value}
        accept={accept}
        multiple={multiple}
        hidden={type === "file"}
        placeholder=""
        onFocus={onFocus}
      />
      <label
        htmlFor={id || "input-" + value}
        className={styleType[type]?.label || styleType["text"].label}
      >
        {children}
      </label>
    </div>
  );
}
