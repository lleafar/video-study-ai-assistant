export default function Button({
  className,
  children,
  route,
  onClick,
}: {
  className?: string;
  children?: React.ReactNode;
  route?: string;
  onClick?: () => void;
}) {
  const baseStyles = "flex items-center rounded-full hover:bg-zinc-600/30 transition-colors text-sm";
  const linkStyles= "relative z-10  flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2";

  return (
    <div
      className={baseStyles + " " + (className || "")}
    >
      <a
        href={route}
        onClick={onClick}
        className={linkStyles}
      >
        {children}
      </a>
    </div>
  );
}
