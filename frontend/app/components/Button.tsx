export default function Button({
  className,
  children,
  route,
  styleType = "primary",
  type = "default",
  onClick,
}: {
  className?: string;
  children?: React.ReactNode;
  route?: string;
  styleType?: "primary" | "secondary" | "tertiary";
  type?: "default" | "submit";
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const styles = {
    primary: {
      base: `flex items-center rounded-full ${type === "submit" ? "font-semibold text-indigo-500 bg-blue-200 hover:bg-blue-200/90" : "bg-zinc-950/30 hover:bg-zinc-600/30"} transition-colors text-sm`,
      link: "relative flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2",
    },
    secondary: {
      base: `flex items-center rounded-full ${type === "submit" ? "font-semibold text-indigo-300 bg-blue-200/20 hover:bg-blue-300/10" : "hover:bg-zinc-600/30"} transition-colors text-sm`,
      link: "relative flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2",
    },
    tertiary: {
      base: "hover:opacity-70 transition-opacity cursor-pointer",
      link: "relative flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2",
    },
  };

  return (
    <div
      className={
        (styles[styleType]?.base || styles["primary"].base) +
        " " +
        (className || "")
      }
    >
      <a
        href={route}
        onClick={onClick}
        className={styles[styleType]?.link || styles["primary"].link}
      >
        {children}
      </a>
    </div>
  );
}
